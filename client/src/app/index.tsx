import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';

import { indexStyles } from '@/styles/indexScreen';
import { SettingsButton } from '@/components/SettingsButton';
import { useTheme } from '@/hooks/use-theme';
import { AudioInformationBoard } from '@/components/AudioInformationBoard';
import { AudioData } from '@/types/audio';

type ContentKey = 'music' | 'podcast';

type CardData = {
  key: ContentKey;
  title: string;
  subtitle: string;
  description: string;
  type: ContentKey;
  audio: AudioData | null;
  loading: boolean;
};

export default function App() {
  const theme = useTheme();
  const [message, setMessage] = useState("Trying to connect...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicAudio, setMusicAudio] = useState<AudioData | null>(null);
  const [podcastAudio, setPodcastAudio] = useState<AudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeContent, setActiveContent] = useState<ContentKey>('music');
  const [playerState, setPlayerState] = useState<Record<ContentKey, { position: number; duration: number }>>({
    music: { position: 42, duration: 238 },
    podcast: { position: 305, duration: 1800 },
  });
  const swapProgress = useRef(new Animated.Value(0)).current;

  const musicCard: CardData = {
    key: 'music',
    title: musicAudio?.name ?? 'Music',
    subtitle: musicAudio?.author ?? 'Unknown artist',
    description: musicAudio?.description ?? 'No description available',
    type: 'music' as const,
    audio: musicAudio,
    loading,
  };

  const podcastCard: CardData = {
    key: 'podcast',
    title: podcastAudio?.name ?? 'Focus Journal',
    subtitle: podcastAudio?.author ?? 'Podcast episode',
    description: podcastAudio?.description ?? 'A temporary podcast placeholder used to prototype the content card switch interaction.',
    type: 'podcast' as const,
    audio: podcastAudio,
    loading,
  };

  const cards: Record<ContentKey, CardData> = {
    music: musicCard,
    podcast: podcastCard,
  };
  const activeCard = cards[activeContent];
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

  const handleSwapContent = () => {
    setActiveContent((prev) => (prev === 'music' ? 'podcast' : 'music'));
  };

  const handleSkip = (deltaSeconds: number) => {
    updatePlayerPosition(activeContent, activePlayer.position + deltaSeconds);
  };

  const renderCardContent = (card: CardData, layer: 'front' | 'back') => {
    const isFront = layer === 'front';

    if (card.type === 'music') {
      return (
        <>
          <View style={[indexStyles.cardHeader, !isFront && indexStyles.cardHeaderCompact]}>
            <Text style={[indexStyles.cardType, { color: theme.text }]}>MUSIC</Text>
            <Text style={[indexStyles.cardTitle, { color: theme.text }]}>{card.title}</Text>
          </View>
          <View style={indexStyles.cardMediaWrap}>
            <AudioInformationBoard audio={card.audio} loading={card.loading} theme={theme} />
          </View>
        </>
      );
    }

    return (
      <>
        <View style={[indexStyles.cardHeader, !isFront && indexStyles.cardHeaderCompact]}>
          <Text style={[indexStyles.cardType, { color: theme.text }]}>PODCAST</Text>
          <Text style={[indexStyles.cardTitle, { color: theme.text }]}>{card.title}</Text>
        </View>

        {card.audio ? (
          <View style={indexStyles.cardMediaWrap}>
            <AudioInformationBoard audio={card.audio} loading={card.loading} theme={theme} />
          </View>
        ) : (
          <>
            <View style={[indexStyles.podcastVisual, { backgroundColor: theme.backgroundElement }]}>
              <View style={indexStyles.podcastGlow} />
              <Text style={[indexStyles.podcastVisualLabel, { color: theme.text }]}>Podcast</Text>
            </View>
            <View style={indexStyles.podcastMeta}>
              <Text style={[indexStyles.podcastSubtitle, { color: theme.text }]}>{card.subtitle}</Text>
              <Text style={[indexStyles.podcastDescription, { color: theme.textSecondary }]} numberOfLines={isFront ? 3 : 2}>
                {card.description}
              </Text>
            </View>
          </>
        )}
      </>
    );
  };

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/audio/type/MUSIC`).then(response => response.json()),
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/audio/type/PODCAST`).then(response => response.json()),
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/audio/1`).then(response => response.json()),
    ])
      .then(([musicResult, podcastResult, musicFallbackResult]) => {
        const musicByType =
          musicResult.status === 'fulfilled' && Array.isArray(musicResult.value)
            ? musicResult.value[0] ?? null
            : null;

        const musicFallback =
          musicFallbackResult.status === 'fulfilled' && musicFallbackResult.value?.id
            ? musicFallbackResult.value
            : null;

        const podcastByType =
          podcastResult.status === 'fulfilled' && Array.isArray(podcastResult.value)
            ? podcastResult.value[0] ?? null
            : null;

        const resolvedMusic = musicByType ?? musicFallback;

        setMusicAudio(resolvedMusic);
        setPodcastAudio(podcastByType);
        setLoading(false);
        setMessage(resolvedMusic ? 'Connected' : 'Failed to connect');
      })
      .catch(() => {
        setLoading(false);
        setMessage('Failed to connect');
      });
  }, []);

  useEffect(() => {
    Animated.spring(swapProgress, {
      toValue: activeContent === 'music' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 68,
    }).start();
  }, [activeContent, swapProgress]);

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

  const musicCardMotionStyle = {
    opacity: swapProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.82],
    }),
    transform: [
      {
        translateX: swapProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 58],
        }),
      },
      {
        translateY: swapProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 22],
        }),
      },
    ],
  };

  const podcastCardMotionStyle = {
    opacity: swapProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.82, 1],
    }),
    transform: [
      {
        translateX: swapProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [58, 0],
        }),
      },
      {
        translateY: swapProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
    ],
  };

  const cardRenderOrder: ContentKey[] =
    activeContent === 'music' ? ['podcast', 'music'] : ['music', 'podcast'];

  return (
    <View
      style={[indexStyles.screen, { backgroundColor: theme.background }]}
      accessibilityLabel="Playback screen"
    >
      <View style={indexStyles.gradientLayerOne} />
      <View style={indexStyles.gradientLayerTwo} />

      <View style={indexStyles.stack}>
        <View
          style={indexStyles.cardStage}
          accessibilityLabel="Main playback panel"
        >
          <View style={indexStyles.cardStack}>
            {cardRenderOrder.map((cardKey) => {
              const card = cardKey === 'music' ? musicCard : podcastCard;
              const isFront = activeContent === cardKey;
              const motionStyle = cardKey === 'music' ? musicCardMotionStyle : podcastCardMotionStyle;

              return (
                <Animated.View
                  key={cardKey}
                  style={[
                    indexStyles.swapCard,
                    isFront ? indexStyles.frontCard : indexStyles.backCard,
                    motionStyle,
                    { backgroundColor: theme.backgroundSelected, borderColor: theme.backgroundElement },
                  ]}
                >
                  <Pressable
                    onPress={handleSwapContent}
                    style={indexStyles.swapPressable}
                    accessibilityLabel={`${card.type} content card`}
                  >
                    {renderCardContent(card, isFront ? 'front' : 'back')}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={indexStyles.progressDock} accessibilityLabel="Progress bar slot">
        <View style={[indexStyles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
          <View style={[indexStyles.progressFill, { backgroundColor: theme.text, width: progressWidth }]} />
        </View>
        <View style={indexStyles.progressMeta}>
          <Text style={[indexStyles.metaText, { color: theme.textSecondary }]}>{formatTime(activePlayer.position)}</Text>
          <Text style={[indexStyles.metaText, { color: theme.textSecondary }]}>{formatTime(activePlayer.duration)}</Text>
        </View>
      </View>

      <View style={indexStyles.transportDock} accessibilityLabel="Playback controls">
        <Pressable
          accessibilityLabel="Skip backward 15 seconds"
          onPress={() => handleSkip(-15)}
          style={[indexStyles.transportButton, { backgroundColor: theme.backgroundSelected }]}
        >
          <RotateCcw color={theme.textSecondary} size={20} strokeWidth={2.2} />
          <Text style={[indexStyles.transportHint, { color: theme.textSecondary }]}>15</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={isPlaying ? 'Pause playback' : 'Play playback'}
          onPress={() => setIsPlaying((prev) => !prev)}
          style={[indexStyles.transportPrimary, { backgroundColor: theme.text }]}
        >
          {isPlaying ? (
            <Pause color={theme.background} size={24} strokeWidth={2.6} />
          ) : (
            <Play color={theme.background} size={24} strokeWidth={2.6} />
          )}
        </Pressable>

        <Pressable
          accessibilityLabel="Skip forward 15 seconds"
          onPress={() => handleSkip(15)}
          style={[indexStyles.transportButton, { backgroundColor: theme.backgroundSelected }]}
        >
          <RotateCw color={theme.textSecondary} size={20} strokeWidth={2.2} />
          <Text style={[indexStyles.transportHint, { color: theme.textSecondary }]}>15</Text>
        </Pressable>
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
