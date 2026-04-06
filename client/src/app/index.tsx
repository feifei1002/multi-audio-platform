import { act, useEffect, useRef, useState } from 'react';
import { Animated, DimensionValue, Pressable, Text, View } from 'react-native';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';

import { indexStyles } from '@/styles/indexScreen';
import { SettingsButton } from '@/components/SettingsButton';
import { useTheme } from '@/hooks/use-theme';
import { AudioInformationBoard } from '@/components/AudioInformationBoard';
import { AudioData } from '@/types/audio';
import { CARDS } from '@/types/cards';
import { useCardSwipe } from '@/hooks/use-card-swipe';
import { getUserSession } from '@/utils/storage';
import { UserProfile } from '@/types/user';
import { PlayToggleButton } from '@/components/PlayToggleButton';

type ContentKey = 'music' | 'podcast';

export default function App() {
  const theme = useTheme();
  const [message, setMessage] = useState("Trying to connect...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [musicAudio, setMusicAudio] = useState<AudioData | null>(null);
  const [podcastAudio, setPodcastAudio] = useState<AudioData | null>(null);
  const [musicId, setMusicId] = useState(1);
  const [podcastId, setPodcastId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeContent, setActiveContent] = useState<ContentKey>('music');
  const [playerState, setPlayerState] = useState<Record<ContentKey, { position: number; duration: number }>>({
    music: { position: 42, duration: 238 },
    podcast: { position: 305, duration: 1800 },
  });
  const swapProgress = useRef(new Animated.Value(0)).current;
  const [activeCardIndex, setActiveCardIndex] = useState<number>(
    Math.max(CARDS.indexOf('MUSIC'), 0),
  );
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const saveNavigationState = async (cardIdentifier: string) => {
    if (!userId) return;
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/navigation/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cardIdentifier,
        }),
      });
    } catch (err) {
      console.error("Persistence failed:", err);
    }
  };

  const handleCardNavigation = (direction: 'next' | 'previous') => {
    setActiveCardIndex((prev) => {
      if (direction === 'next') return (prev + 1) % CARDS.length;
      return (prev - 1 + CARDS.length) % CARDS.length;
    });
  };

  const handleTapSwap = () => {
    // Moves to the next card in the array
    setActiveCardIndex((prev) => (prev + 1) % CARDS.length);
  };

  const swipeHandlers = useCardSwipe({
    onSwipeLeft: () => handleCardNavigation('next'),
    onSwipeRight: () => handleCardNavigation('previous'),
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const savedUserId = await getUserSession('userId');
        if (savedUserId) {
          setUserId(Number(savedUserId));
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
      })
      .catch(err => console.log("Failed to load user profile:", err));

    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/navigation/${userId}`)
      .then(response => {
        if (response.status === 404) {
          console.log("New user detected. Initializing navigation state...");
          saveNavigationState(CARDS[Math.max(CARDS.indexOf('MUSIC'), 0)]);
          return null;
        }
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to fetch navigation state " + response.status);
      })
      .then(data => {
        if (data?.cardIdentifier) {
          const index = CARDS.indexOf(data.cardIdentifier);
          if (index !== -1) {
            setActiveCardIndex(index);
          }
        }
      })
      .catch(() => console.log("New user: Initializing state..."));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const currentCard = CARDS[activeCardIndex];
    saveNavigationState(currentCard);
    swapProgress.setValue(0);
    Animated.spring(swapProgress, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
  }, [activeCardIndex, userId]);

  const activePlayer = playerState[activeContent];
  const progressRatio = activePlayer.duration > 0 ? activePlayer.position / activePlayer.duration : 0;
  const progressWidth = `${Math.min(Math.max(progressRatio, 0), 1) * 100}%`;

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const updatePlayerPosition = (content: ContentKey, nextPosition: number) => {
    setPlayerState((prev) => {
      const current = prev[content];
      const boundedPosition = Math.min(Math.max(nextPosition, 0), current.duration);
      if (boundedPosition === current.position) {
        return prev;
      }

      return {
        ...prev,
        [content]: {
          ...current,
          position: boundedPosition,
        },
      };
    });
  };


  const handleTrackSwitch = (direction: 'previous' | 'next') => {
    const currentType = CARDS[activeCardIndex];
    console.log(`Joystick release: Switching ${currentType} to ${direction}`);
    if (currentType === 'MUSIC') {
    setMusicId((prev) => (direction === 'next' ? prev + 1 : Math.max(1, prev - 1)));
  } else if (currentType === 'PODCAST') {
    setPodcastId((prev) => (direction === 'next' ? prev + 1 : Math.max(1, prev - 1)));
  }
  };

  const handleSkip = (deltaSeconds: number) => {
    updatePlayerPosition(activeContent, activePlayer.position + deltaSeconds);
  };

  const renderCardContent = (cardName: string, layer: 'front' | 'back') => {
    const isFront = layer === 'front';
    const currentAudio = cardName === 'MUSIC' ? musicAudio : podcastAudio;
    switch (cardName) {
      case 'PROFILE':
        return (
          <View style={[indexStyles.cardHeader, !isFront && indexStyles.cardHeaderCompact]}>
          <Text style={[indexStyles.cardType, { color: theme.text }]}>PROFILE</Text>
          <Text style={[indexStyles.cardTitle, { color: theme.text }]}>
            {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading Profile...'}
          </Text>
        </View>
        );
      case 'PLAYLIST':
        return (
          <View style={[indexStyles.cardHeader, !isFront && indexStyles.cardHeaderCompact]}>
          <Text style={[indexStyles.cardType, { color: theme.text }]}>PLAYLIST</Text>
          <Text style={[indexStyles.cardTitle, { color: theme.text }]}>
            {userProfile ? `${userProfile.firstName}'s Playlist` : 'User Playlist'}
          </Text>
        </View>
        );
      case 'MUSIC':
      case 'PODCAST':
        return (
          <View style={[indexStyles.cardHeader, !isFront && indexStyles.cardHeaderCompact, { flex: 1 }]}>
            <Text style={[indexStyles.cardType, { color: theme.text }]}>{cardName}</Text>
            
            {/* 1. Audio Info Section */}
            <AudioInformationBoard 
              theme={theme} 
              audio={currentAudio} 
              loading={loading} 
            />

            {/* 2. Playback Controls & Progress - Only on Front */}
            {isFront && (
              <View style={indexStyles.playbackContainer}>
                
                {/* PROGRESS BAR - Now logically above the buttons */}
                <View style={indexStyles.progressContainer}>
                  <View style={[indexStyles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                    <View style={[indexStyles.progressFill, { backgroundColor: theme.text, width: progressWidth as DimensionValue}]} />
                  </View>
                  <View style={indexStyles.progressMeta}>
                    <Text style={[indexStyles.metaText, { color: theme.textSecondary }]}>{formatTime(activePlayer.position)}</Text>
                    <Text style={[indexStyles.metaText, { color: theme.textSecondary }]}>{formatTime(activePlayer.duration)}</Text>
                  </View>
                </View>

                {/* CONTROL ROW */}
                <View style={indexStyles.controlsRow}>
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); handleSkip(-15); }}
                    style={indexStyles.skipButton}
                  >
                    <RotateCcw color={theme.textSecondary} size={22} />
                  </Pressable>

                  <View style={indexStyles.joystickWrapper}>
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
      
      default:
        return null;
    }
  };

  useEffect(() => {
    Animated.spring(swapProgress, {
      toValue: activeCardIndex,
      useNativeDriver: true,
      friction: 8,
      tension: 68,
    }).start();
  }, [activeContent]);

  useEffect(() => {
  if (!userId) return;

  const fetchContent = async (type: 'MUSIC' | 'PODCAST', id: number) => {
    try {
      const url = `${process.env.EXPO_PUBLIC_API_URL}/api/audios/type/${type}/id/${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      const data = await res.json();
      
      if (type === 'MUSIC') setMusicAudio(data);
      else setPodcastAudio(data);
    } catch (err) {
      console.error(`${type} fetch failed:`, err);
    }
  };

  const init = async () => {
    setLoading(true);
    // Fetch both types on mount or whenever IDs change
    await Promise.all([
      fetchContent('MUSIC', musicId),
      fetchContent('PODCAST', podcastId)
    ]);
    setLoading(false);
  };

  init();
}, [musicId, podcastId, userId]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = setInterval(() => {
      setPlayerState((prev) => {
        let hasUpdate = false;
        const nextState = { ...prev };

        (Object.keys(prev) as ContentKey[]).forEach((contentKey) => {
          const current = prev[contentKey];
          if (current.position >= current.duration) {
            return;
          }

          hasUpdate = true;
          nextState[contentKey] = {
            ...current,
            position: Math.min(current.position + 1, current.duration),
          };
        });

        if (!hasUpdate) {
          return prev;
        }

        return nextState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    const allTracksFinished = Object.values(playerState).every(
      ({ position, duration }) => position >= duration,
    );

    if (isPlaying && allTracksFinished) {
      setIsPlaying(false);
    }
  }, [isPlaying, playerState]);

  return (
    <View
      style={[indexStyles.screen, { backgroundColor: theme.background }]}
      accessibilityLabel="Playback screen"
    >
      <View style={indexStyles.gradientLayerOne} />
      <View style={indexStyles.gradientLayerTwo} />

      <View style={indexStyles.stack}>
        <View {...swipeHandlers} style={{ flex: 1 }}>
          <View style={indexStyles.cardStage}>
            <View style={indexStyles.cardStack}>
              {CARDS.map((cardName, index) => {
                const isFront = activeCardIndex === index;
                const isNext = (activeCardIndex + 1) % CARDS.length === index;
                if (!isFront && !isNext) return null;
                const layerType = isFront ? 'front' : 'back';

                const translateX = isFront 
                  ? swapProgress.interpolate({ inputRange: [0, 1], outputRange: [58, 0] }) 
                  : 58;

                const translateY = isFront 
                  ? swapProgress.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) 
                  : 22;

                const scale = isFront 
                  ? swapProgress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) 
                  : 0.9;

                const opacity = isFront 
                  ? swapProgress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) 
                  : 0.6;

                  return (
                  <Animated.View
                    key={cardName}
                    style={[
                      indexStyles.swapCard,
                      {
                        position: 'absolute',
                        zIndex: isFront ? 10 : 5,
                        opacity: opacity,
                        transform: [{ translateX }, { translateY }, { scale }],
                        backgroundColor: theme.backgroundSelected,
                        borderColor: theme.backgroundElement,
                      }
                    ]}
                  >
                    <Pressable 
                      onPress={handleTapSwap} 

                      style={{ flex: 1, padding: 20 }}
                    >
                      {renderCardContent(cardName, layerType)}
                    </Pressable>
                  </Animated.View>
                );
              }
              )}
            </View>

          </View>
        </View>
      </View>

      <SettingsButton
        accessibilityLabel="Settings button slot"
        backgroundColor={theme.backgroundSelected}
        textColor={theme.textSecondary}
        style={indexStyles.settingsButton}
      />
    </View>
  );
}
