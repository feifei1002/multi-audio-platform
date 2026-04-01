import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

export const indexStyles = StyleSheet.create({
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
    backgroundColor: '#b9ccdffa',
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
