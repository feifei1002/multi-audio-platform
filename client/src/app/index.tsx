import { useEffect, useRef, useState } from 'react';
import { Animated, DimensionValue, Pressable, Text, View } from 'react-native';
import { RotateCcw, RotateCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { indexStyles } from '@/styles/indexScreen';
import { SettingsButton } from '@/components/SettingsButton';
import { useTheme } from '@/hooks/use-theme';
import { AudioInformationBoard } from '@/components/AudioInformationBoard';
import { AudioData } from '@/types/audio';
import { CARDS } from '@/types/cards';
import { clearUserSession, getUserSession } from '@/utils/storage';
import { UserProfile } from '@/types/user';
import { PlayToggleButton } from '@/components/PlayToggleButton';
import { ProgressBar } from '@/components/ProgressBar';

type ContentKey = 'music' | 'podcast';

export default function App() {
  const theme = useTheme();
  const router = useRouter();
  
  // --- STATE: UI & Navigation ---
  const [activeCardIndex, setActiveCardIndex] = useState<number>(
    Math.max(CARDS.indexOf('MUSIC'), 0),
  );
  const swapProgress = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- STATE: User & Session ---
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // --- STATE: Audio Data & Selection ---
  const [musicAudio, setMusicAudio] = useState<AudioData | null>(null);
  const [podcastAudio, setPodcastAudio] = useState<AudioData | null>(null);
  const [musicId, setMusicId] = useState(1);
  const [podcastId, setPodcastId] = useState(1);
  // const [activeContent, setActiveContent] = useState<ContentKey>('music');

  // --- STATE: Playback Control ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [playerState, setPlayerState] = useState<Record<ContentKey, { position: number; duration: number }>>({
    music: { position: 42, duration: 238 },
    podcast: { position: 305, duration: 1800 },
  });

  // --- DERIVED STATE
  const currentCardName = CARDS[activeCardIndex];
  const activeContent: ContentKey = currentCardName === 'PODCAST' ? 'podcast' : 'music';
  const activePlayer = playerState[activeContent];

  const saveNavigationState = async (cardIdentifier: string) => {
    if (!userId) return;
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/navigation/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, cardIdentifier:cardIdentifier }),
      });
    } catch (err) {
      console.error("Persistence failed:", err);
    }
  };

  const handleTrackSwitch = (direction: 'previous' | 'next') => {
    const currentType = CARDS[activeCardIndex];
    if (currentType === 'MUSIC') {
      setMusicId((prev) => (direction === 'next' ? prev + 1 : Math.max(1, prev - 1)));
    } else if (currentType === 'PODCAST') {
      setPodcastId((prev) => (direction === 'next' ? prev + 1 : Math.max(1, prev - 1)));
    }
  };

  const handleSkip = (deltaSeconds: number) => {
    setPlayerState((prev) => ({
      ...prev,
      [activeContent]: { 
        ...prev[activeContent], 
        position: Math.min(Math.max(prev[activeContent].position + deltaSeconds, 0), prev[activeContent].duration) 
      },
    }));
  };

  const handleCardPress = () => {
    if (isDraggingSlider) return; 
    setActiveCardIndex((prev) => (prev + 1) % CARDS.length);
    setIsSettingsOpen(false);
  };

  const handleSignOut = async () => {
    await clearUserSession('userId');
    setUserId(null);
    setUserProfile(null);
    setIsSettingsOpen(false);
    setIsPlaying(false);
    router.replace('/sign_in');
  };

  // --- EFFECTS ---

  // 1. Initial Load: User Session
  useEffect(() => {
    getUserSession('userId').then(id => id && setUserId(Number(id)));
  }, []);

  // 2. Fetch User Profile & Navigation State
  useEffect(() => {
    if (!userId) return;
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}`)
    .then(res => {
      if(res.ok) return res.json();
      throw new Error('Failed to fetch user profile');
    })
    .then(setUserProfile)
    .catch(err => console.warn("Profile fetch handled:", err.message));
    
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/navigation/${userId}`)
    .then(res => {
      if (res.ok) return res.json();
      if (res.status === 404) saveNavigationState(CARDS[activeCardIndex]);
      return null;
    }).then(data => { if (data?.cardIdentifier) {
        const nextCardIndex = CARDS.indexOf(data.cardIdentifier);
        setActiveCardIndex(nextCardIndex >= 0 ? nextCardIndex : activeCardIndex);
      } })
      .catch(err => console.warn("Navigation fetch handled:", err.message));
  }, [userId]);

  // 3. Audio Data Fetching: MUSIC & PODCAST
  useEffect(() => {
    if (!userId) return;
    const fetchMusic = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/audios/type/MUSIC/id/${musicId}`);
        if(res.ok) {
          const data = await res.json();
          setMusicAudio(data);
        } else if (res.status === 404) {
          console.log("End of Music playlist, restarting...");
          setMusicId(1);
        }
      } catch (err) {
        console.error('Music fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMusic();
  }, [musicId, userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchPodcast = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/audios/type/PODCAST/id/${podcastId}`);
        if(res.ok) {
          const data = await res.json();
          setPodcastAudio(data);
        } else if (res.status === 404) {
          console.log("End of Podcast playlist, restarting...");
          setPodcastId(1);
        } else {
          console.error('Failed to fetch podcast audio');
        }
      } catch (err) {
        console.error('Podcast fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPodcast();
  }, [podcastId, userId]);

  // 4. Update Persistence & Animation on Card Change
  useEffect(() => {
    if (userId) saveNavigationState(currentCardName);
    swapProgress.setValue(0);
    Animated.spring(swapProgress, { toValue: 1, useNativeDriver: true, friction: 8, tension: 40 }).start();
  }, [activeCardIndex, userId]);

  // 5. Playback Timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setPlayerState((prev) => {
        const curr = prev[activeContent];
        if (curr.position >= curr.duration) { setIsPlaying(false); return prev; }
        return { ...prev, [activeContent]: { ...curr, position: curr.position + 1 } };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, activeContent]);

  // 6. Monitor Playback Completion
  useEffect(() => {
    const allTracksFinished = Object.values(playerState).every(
      ({ position, duration }) => position >= duration,
    );

    if (isPlaying && allTracksFinished) setIsPlaying(false);
  }, [isPlaying, playerState]);

  // --- RENDER HELPERS ---
  const renderCardContent = (cardName: string, isFront: boolean) => {
    const currentAudio = cardName === 'MUSIC' ? musicAudio : podcastAudio;
    const themeStyle = { color: theme.text };

    if (cardName === 'PROFILE' || cardName === 'PLAYLIST') {
      return (
        <View style={[indexStyles.cardHeader, !isFront && indexStyles.cardHeaderCompact]}>
          <Text style={[indexStyles.cardType, themeStyle]}>{cardName}</Text>
          <Text style={[indexStyles.cardTitle, themeStyle]}>
            {cardName === 'PROFILE' 
              ? (userProfile ? `${userProfile.firstName} ${userProfile.lastName}'s Profile` : 'Loading...') 
              : (userProfile ? `${userProfile.firstName}'s Playlist` : 'Playlist')}
          </Text>
        </View>
      );
    }

    return (
      <View style={[indexStyles.cardHeader, !isFront && indexStyles.cardHeaderCompact, { flex: 1 }]}>
        <Text style={[indexStyles.cardType, themeStyle]}>{cardName}</Text>
        
        {/* 1. Audio Info Section */}
        <AudioInformationBoard theme={theme} audio={currentAudio} loading={loading} />

        {/* 2. Playback Controls & Progress */}
        {isFront && (
          <View style={indexStyles.playbackContainer}>
            
            {/* PROGRESS BAR */}
            <ProgressBar 
              theme={theme}
              position={activePlayer.position}
              duration={activePlayer.duration}
              onSeek={(newSeconds) => {
                setPlayerState(prev => ({
                  ...prev,
                  [activeContent]: { ...prev[activeContent], position: newSeconds }
                }));
              }}
              onInteractionChange={setIsDraggingSlider}
            />

            {/* CONTROL ROW */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              width: '100%', 
              paddingHorizontal: 10,
              height: 120 
            }}>
              {/* Backward 15s */}
              <Pressable
                onPress={(e) => { e.stopPropagation(); handleSkip(-15); }}
                style={indexStyles.skipButton}
              >
                <RotateCcw color={theme.textSecondary} size={22} />
              </Pressable>

              {/* THE JOYSTICK */}
              <View style={{ width: 100, alignItems: 'center', justifyContent: 'center' }}>
                <PlayToggleButton
                  isPlaying={isPlaying}
                  backgroundColor={theme.textSecondary}
                  textColor={theme.text}
                  volume={volume}
                  onVolumeChange={setVolume}
                  onTrackSwitch={handleTrackSwitch}
                  onPress={() => setIsPlaying(!isPlaying)}
                />
              </View>

              {/* Forward 15s */}
              <Pressable
                onPress={(e) => { e.stopPropagation(); handleSkip(15); }}
                style={indexStyles.skipButton}
              >
                <RotateCw color={theme.textSecondary} size={22} />
              </Pressable>
            </View>

          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[indexStyles.screen, { backgroundColor: theme.background }]}>
      <View style={indexStyles.gradientLayerOne} /><View style={indexStyles.gradientLayerTwo} />
      <View style={indexStyles.stack}>
        <View style={indexStyles.cardStack}>
          {CARDS.map((cardName, index) => {
            const isFront = activeCardIndex === index;
            const isNext = (activeCardIndex + 1) % CARDS.length === index;
            if (!isFront && !isNext) return null;

            return (
              <Animated.View key={cardName} style={[indexStyles.swapCard, {
                zIndex: isFront ? 10 : 5,
                opacity: isFront ? swapProgress : 0.6,
                transform: [
                  { translateX: isFront ? swapProgress.interpolate({ inputRange: [0, 1], outputRange: [58, 0] }) : 58 },
                  { translateY: isFront ? swapProgress.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) : 22 },
                  { scale: isFront ? swapProgress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) : 0.9 }
                ],
                backgroundColor: theme.backgroundSelected,
              }]}>
                <Pressable onPress={handleCardPress} style={{ flex: 1, padding: 20 }}>
                  {renderCardContent(cardName, isFront)}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
      <View style={indexStyles.settingsMenuAnchor}>
        <SettingsButton
          style={indexStyles.settingsButton}
          backgroundColor={theme.backgroundSelected}
          textColor={theme.textSecondary}
          onPress={() => setIsSettingsOpen((prev) => !prev)}
        />
        {isSettingsOpen && (
          <View style={[indexStyles.settingsDropdown, { backgroundColor: theme.backgroundSelected }]}>
            <Pressable
              onPress={handleSignOut}
              style={indexStyles.settingsDropdownItem}
              accessibilityLabel="Sign out"
            >
              <Text style={[indexStyles.settingsDropdownText, { color: theme.text }]}>
                Sign out
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
