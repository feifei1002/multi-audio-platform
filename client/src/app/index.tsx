import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { indexStyles } from '@/styles/indexScreen';
import { ContentsSwitchButton } from '@/components/ContentsSwitchButton';
import { PlayToggleButton } from '@/components/PlayToggleButton';
import { SettingsButton } from '@/components/SettingsButton';
import { useTheme } from '@/hooks/use-theme';
import { AudioInformationBoard } from '@/components/AudioInformationBoard';
import { AudioData } from '@/types/audio';
import { CARDS } from '@/types/cards';
import { useCardSwipe } from '@/hooks/use-card-swipe';
import { getUserSession } from '@/utils/storage';
import { UserProfile } from '@/types/user';

export default function App() {
  const theme = useTheme();
  const [message, setMessage] = useState("Trying to connect...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [audio, setAudio] = useState<AudioData | null>(null);
  const [audioId, setAudioId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect (() => {
    async function loadUser() {
      try {
        const savedUserId = await getUserSession('userId');
        if(savedUserId) {
          setUserId(Number(savedUserId))
        }
      } catch (error) {
        console.error("Error loading user session:", error);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}`)
      .then(response => response.json())
      .then((data: UserProfile) => {
        setUserProfile(data);
      }).catch(err => console.log("Failed to load user profile:", err));


    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/navigation/${userId}`)
      .then(response => {
        if(response.status === 204 || !response.ok) {
          saveNavigationState(CARDS[activeCardIndex]);
        } else {
          return response.json();
        }
      })
      .then(data => {
        if (data?.cardIdentifier) {
          const index = CARDS.indexOf(data.cardIdentifier);
          if (index !== -1) {
            setActiveCardIndex(index);
          }
        }
      })
      .catch(err => console.log("New user: Initializing state..."));
  }, [userId]);

  const handleCardNavigation = (direction: 'next' | 'previous') => {
  setActiveCardIndex((prev) => {
    if (direction === 'next') return (prev + 1) % CARDS.length;
    return (prev - 1 + CARDS.length) % CARDS.length;
  });
};

  useEffect(() => {
    const currentCard = CARDS[activeCardIndex];
    saveNavigationState(currentCard);
  }, [activeCardIndex]);

  const saveNavigationState = async (cardIdentifier: string) => {
    if (!userId) return;
  try {
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/navigation/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        cardIdentifier: cardIdentifier,
      }),
    });
  } catch (err) {
    console.error("Persistence failed:", err);
  }
};

const swipeHandlers = useCardSwipe({
    onSwipeLeft: () => handleCardNavigation('next'),
    onSwipeRight: () => handleCardNavigation('previous'),
  });

  const playbackLabel = isPlaying ? 'Playing' : 'Paused';

  const handleTogglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleTrackSwitch = (direction: 'previous' | 'next') => {
    setMessage(direction === 'next' ? 'Switched to next track' : 'Switched to previous track');
    setAudioId((currentId) => {
      if (direction === 'next') {
        return currentId + 1;
      } else {
        return currentId > 1 ? currentId - 1 : 1; // Prevents going below 1
      }
    });
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/audio/${audioId}`)
      .then(response => response.json())
      .then(data => {
        setAudio(data);
        setLoading(false);
        setMessage('Connected');
      })
      .catch(err => {
        setLoading(false);
        setMessage('Failed to connect');
      });
  }, [audioId]);

  return (
    <View
      style={[indexStyles.screen, { backgroundColor: theme.background }]}
      accessibilityLabel="Playback screen"
    >
      <View style={indexStyles.gradientLayerOne} />
      <View style={indexStyles.gradientLayerTwo} />

      <View style={indexStyles.stack}>
        <View style={[indexStyles.glassCard, indexStyles.cardOffset, { borderColor: theme.backgroundSelected }]}>
          <View style={[indexStyles.glassHighlight, { backgroundColor: theme.backgroundElement }]} />
        </View>
        <View {...swipeHandlers} style={{ flex: 1 }}>
        
        {/* CARD 1: PROFILE */}
        {CARDS[activeCardIndex] === 'PROFILE' && (
        <View
          style={[indexStyles.glassCard, indexStyles.mainCard, { borderColor: theme.backgroundSelected }]}
          accessibilityLabel="Profile panel"
        >
          <View style={indexStyles.headerRow}>
            <Text style={[indexStyles.title, { color: theme.text }]}>Profile</Text>
          </View>
          <View style={[indexStyles.heroCard, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{color: theme.textSecondary}}>
              {userProfile 
              ? `${userProfile.firstName} ${userProfile.lastName}` 
              : 'Loading Profile...'}
            </Text>

              {userProfile && (
                <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
                {userProfile.dateOfBirth}
                </Text>
              )}
          </View>
        </View>
        )}

        {/* CARD 2: AUDIO PLAYER */}
        {CARDS[activeCardIndex] === 'AUDIO_PLAYER' && (

        <View
          style={[indexStyles.glassCard, indexStyles.mainCard, { borderColor: theme.backgroundSelected }]}
          accessibilityLabel="Main playback panel"
        >
          <View style={indexStyles.headerRow}>
            <Text style={[indexStyles.typeTag, { color: theme.text }]}>{audio?.type?.toUpperCase()}</Text>
            <Text style={[indexStyles.title, { color: theme.text }]}>{audio?.name}</Text>
            <Text style={[indexStyles.status, { color: theme.textSecondary }]}>
              {playbackLabel} • Volume {volume}%
            </Text>
            <Text style={[indexStyles.connectionStatus, { color: theme.textSecondary }]}>{message}</Text>
          </View>

          <View style={[indexStyles.heroCard, { backgroundColor: theme.backgroundSelected }]}
            accessibilityLabel="Album or podcast card slot"
          >
          <AudioInformationBoard audio={audio} loading={loading} theme={theme} />
          </View>
        </View>
        )}


        {/* CARD 3: PLAYLIST */}
        {CARDS[activeCardIndex] === 'PLAYLIST' && (
        <View
          style={[indexStyles.glassCard, indexStyles.mainCard, { borderColor: theme.backgroundSelected }]}
          accessibilityLabel="Playlist panel"
        >
          <View style={indexStyles.headerRow}>
            <Text style={[indexStyles.title, { color: theme.text }]}>Playlist</Text>
          </View>
          <View style={[indexStyles.heroCard, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{color: theme.textSecondary}}>User Playlist Here</Text>
          </View>
        </View>
        )}
        </View>
      </View>

      <View style={indexStyles.progressDock} accessibilityLabel="Progress bar slot">
        <View style={[indexStyles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
          <View style={[indexStyles.progressFill, { backgroundColor: theme.text }]} />
        </View>
        <View style={indexStyles.progressMeta}>
          <Text style={[indexStyles.metaText, { color: theme.textSecondary }]}>0:42</Text>
          <Text style={[indexStyles.metaText, { color: theme.textSecondary }]}>3:58</Text>
        </View>
      </View>

      <PlayToggleButton
        isPlaying={isPlaying}
        accessibilityLabel={isPlaying ? 'Pause toggle button slot' : 'Play toggle button slot'}
        backgroundColor={theme.backgroundSelected}
        textColor={theme.textSecondary}
        volume={volume}
        onVolumeChange={setVolume}
        onTrackSwitch={handleTrackSwitch}
        onPress={handleTogglePlayPause}
        style={indexStyles.musicButton}
      />
      <ContentsSwitchButton
        accessibilityLabel="Contents switch button slot"
        backgroundColor={theme.backgroundSelected}
        textColor={theme.textSecondary}
        style={indexStyles.podcastButton}
      />
      <SettingsButton
        accessibilityLabel="Settings button slot"
        backgroundColor={theme.backgroundSelected}
        textColor={theme.textSecondary}
        style={indexStyles.settingsButton}
      />
    </View>
  );
}
