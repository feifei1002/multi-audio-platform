import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

export const playToggleButtonStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joystick: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTrackVertical: {
    position: 'absolute',
    left: -Spacing.three,
    width: 6,
    height: 64,
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    opacity: 0.9,
  },
  miniFillVertical: {
    width: '100%',
    borderRadius: 999,
  },
  trackHintWrap: {
    position: 'absolute',
    top: 74,
    minWidth: 150,
    alignItems: 'center',
  },
  trackHintText: {
    fontSize: 10,
    textAlign: 'center',
  },
});
