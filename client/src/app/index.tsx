import { useEffect, useRef, useState } from 'react';
import { Animated, DimensionValue, Pressable, Text, View } from 'react-native';
import { RotateCcw, RotateCw } from 'lucide-react-native';

import { indexStyles } from '@/styles/indexScreen';
import { SettingsButton } from '@/components/SettingsButton';
import { useTheme } from '@/hooks/use-theme';
import { AudioInformationBoard } from '@/components/AudioInformationBoard';
import { AudioData } from '@/types/audio';
import { CARDS } from '@/types/cards';
import { getUserSession } from '@/utils/storage';
import { UserProfile } from '@/types/user';
import { PlayToggleButton } from '@/components/PlayToggleButton';

type ContentKey = 'music' | 'podcast';

export default function App() {
  const theme = useTheme();
  
  // --- STATE: UI & Navigation ---
  const [activeCardIndex, setActiveCardIndex] = useState<number>(
    Math.max(CARDS.indexOf('MUSIC'), 0),
  );
  const swapProgress = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);

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
  const [playerState, setPlayerState] = useState<Record<ContentKey, { position: number; duration: number }>>({
    music: { position: 42, duration: 238 },
    podcast: { position: 305, duration: 1800 },
  });

  // --- DERIVED STATE
  const currentCardName = CARDS[activeCardIndex];
  const activeContent: ContentKey = currentCardName === 'PODCAST' ? 'podcast' : 'music';
  const activePlayer = playerState[activeContent];
  const progressRatio = activePlayer.duration > 0 ? activePlayer.position / activePlayer.duration : 0;
  const progressWidth = `${Math.min(Math.max(progressRatio, 0), 1) * 100}%` as DimensionValue;

  // HELPERS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const saveNavigationState = async (cardIdentifier: string) => {
    if (!userId) return;
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/navigation/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cardIdentifier }),
      });
    } catch (err) {
      console.error("Persistence failed:", err);
    }
  };

  const handleTapSwap = () => {
    setActiveCardIndex((prev) => (prev + 1) % CARDS.length);
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

  // --- EFFECTS ---

  // 1. Initial Load: User Session
  useEffect(() => {
    getUserSession('userId').then(id => id && setUserId(Number(id)));
  }, []);

  // 2. Fetch User Profile & Navigation State
  useEffect(() => {
    if (!userId) return;
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}`).then(res => res.json()).then(setUserProfile);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/navigation/${userId}`).then(res => {
      if (res.ok) return res.json();
      if (res.status === 404) saveNavigationState(CARDS[activeCardIndex]);
      return null;
    }).then(data => { if (data?.cardIdentifier) setActiveCardIndex(CARDS.indexOf(data.cardIdentifier)); });
  }, [userId]);

  // 3. Audio Data Fetching
  useEffect(() => {
    if (!userId) return;
    const fetchContent = async (type: 'MUSIC' | 'PODCAST', id: number) => {
    try {
      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/audios/type/${type}/id/${id}`;
      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 404) {
          console.log(`No more ${type} tracks available at ID: ${id}`);

        }
        return;
      }
      const data = await res.json();
      
      if (type === 'MUSIC') setMusicAudio(data);
      else setPodcastAudio(data);
      
    } catch (err) {
      console.error(`${type} fetch failed:`, err);
    }
  };
    setLoading(true);
    Promise.all([fetchContent('MUSIC', musicId), fetchContent('PODCAST', podcastId)]).finally(() => setLoading(false));
  }, [musicId, podcastId, userId]);

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
              ? (userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...') 
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
            <View style={indexStyles.progressContainer}>
              <View style={[indexStyles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                <View style={[indexStyles.progressFill, { backgroundColor: theme.text, width: progressWidth }]} />
              </View>
              <View style={indexStyles.progressMeta}>
                <Text style={[indexStyles.metaText, { color: theme.textSecondary }]}>{formatTime(activePlayer.position)}</Text>
                <Text style={[indexStyles.metaText, { color: theme.textSecondary }]}>{formatTime(activePlayer.duration)}</Text>
              </View>
            </View>

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
                  backgroundColor={theme.backgroundSelected}
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
        <View {...handleTapSwap} style={indexStyles.cardStack}>
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
                <Pressable onPress={() => setActiveCardIndex((prev) => (prev + 1) % CARDS.length)} style={{ flex: 1, padding: 20 }}>
                  {renderCardContent(cardName, isFront)}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
      <SettingsButton style={indexStyles.settingsButton} backgroundColor={''} textColor={''} />
    </View>
  );
}