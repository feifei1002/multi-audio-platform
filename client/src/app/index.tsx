import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { ContentsSwitchButton } from '@/components/ContentsSwitchButton';
import { PlayToggleButton } from '@/components/PlayToggleButton';
import { SettingsButton } from '@/components/SettingsButton';
import { useTheme } from '@/hooks/use-theme';
import { AudioInformationBoard } from '@/components/AudioInformationBoard';
import { AudioData } from '@/types/audio';

export default function App() {
  const theme = useTheme();
  const [message, setMessage] = useState("Trying to connect...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [audio, setAudio] = useState<AudioData | null>(null);
  const [audioId, setAudioId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const playbackLabel = isPlaying ? 'Playing' : 'Paused';

  const handleTogglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleTrackSwitch = (direction: 'previous' | 'next') => {
    setMessage(direction === 'next' ? 'Switched to next track' : 'Switched to previous track');
  };

  useEffect(() => {
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
  }, []);

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.background }]}
      accessibilityLabel="Playback screen"
    >
      <View style={styles.gradientLayerOne} />
      <View style={styles.gradientLayerTwo} />

      <View style={styles.stack}>
        <View
          style={[styles.glassCard, styles.cardOffset, { borderColor: theme.backgroundSelected }]}
          accessibilityLabel="Background card layer"
        >
          <View style={[styles.glassHighlight, { backgroundColor: theme.backgroundElement }]} />
        </View>

        <View
          style={[styles.glassCard, styles.mainCard, { borderColor: theme.backgroundSelected }]}
          accessibilityLabel="Main playback panel"
        >
          <View style={styles.headerRow}>
            <Text style={[styles.typeTag, { color: theme.text }]}>{audio?.type?.toUpperCase()}</Text>
            <Text style={[styles.title, { color: theme.text }]}>{audio?.name}</Text>
            <Text style={[styles.status, { color: theme.textSecondary }]}>
              {playbackLabel} • Volume {volume}%
            </Text>
            <Text style={[styles.connectionStatus, { color: theme.textSecondary }]}>{message}</Text>
          </View>

          <View style={[styles.heroCard, { backgroundColor: theme.backgroundSelected }]}
            accessibilityLabel="Album or podcast card slot"
          >
            <AudioInformationBoard audio={audio} loading={loading} theme={theme} />
          </View>
        </View>
      </View>

      <View style={styles.progressDock} accessibilityLabel="Progress bar slot">
        <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.text }]} />
        </View>
        <View style={styles.progressMeta}>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>0:42</Text>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>3:58</Text>
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
        style={styles.musicButton}
      />
      <ContentsSwitchButton
        accessibilityLabel="Contents switch button slot"
        backgroundColor={theme.backgroundSelected}
        textColor={theme.textSecondary}
        style={styles.podcastButton}
      />
      <SettingsButton
        accessibilityLabel="Settings button slot"
        backgroundColor={theme.backgroundSelected}
        textColor={theme.textSecondary}
        style={styles.settingsButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
    overflow: 'hidden',
  },
  gradientLayerOne: {
    position: 'absolute',
    width: '120%',
    height: '60%',
    top: '-10%',
    left: '-10%',
    borderRadius: 320,
    backgroundColor: '#2D4B6A',
    opacity: 0.25,
  },
  gradientLayerTwo: {
    position: 'absolute',
    width: '120%',
    height: '60%',
    bottom: '-15%',
    right: '-10%',
    borderRadius: 320,
    backgroundColor: '#7E8FA4',
    opacity: 0.2,
  },
  stack: {
    width: '100%',
    maxWidth: 720,
  },
  glassCard: {
    borderRadius: 28,
    padding: Spacing.five,
    borderWidth: 1,
    shadowColor: '#0B1824',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  cardOffset: {
    position: 'absolute',
    top: -Spacing.four,
    left: Spacing.four,
    right: Spacing.one,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    gap: Spacing.three,
  },
  glassHighlight: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 120,
    height: 120,
    borderRadius: 80,
    opacity: 0.2,
  },
  headerRow: {
    gap: Spacing.one,
  },
  typeTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  status: {
    fontSize: 12,
  },
  connectionStatus: {
    fontSize: 11,
  },
  heroCard: {
    width: '100%',
    height: 320,
    borderRadius: 28,
    overflow: 'hidden',
  },
  progressDock: {
    position: 'absolute',
    bottom: Spacing.five,
    left: Spacing.five,
    right: Spacing.five,
    alignItems: 'center',
  },
  progressTrack: {
    width: '60%',
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    width: '35%',
    height: '100%',
    borderRadius: 999,
  },
  progressMeta: {
    width: '60%',
    marginTop: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
  },
  musicButton: {
    left: '25%',
    marginLeft: -32,
    bottom: Spacing.five + 96,
  },
  podcastButton: {
    left: '75%',
    marginLeft: -32,
    bottom: Spacing.five + 96,
  },
  settingsButton: {
    top: Spacing.four,
    right: Spacing.four,
  },
});