import { StyleSheet } from 'react-native';

export const cornerButtonStyles = StyleSheet.create({
  base: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1824',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
