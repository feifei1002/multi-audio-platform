import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';

type CornerButtonProps = {
  label: string;
  accessibilityLabel?: string;
  backgroundColor: string;
  textColor: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
};

const noop = () => undefined;

export function CornerButton({
  label,
  accessibilityLabel,
  backgroundColor,
  textColor,
  onPress,
  onLongPress,
  style,
}: CornerButtonProps) {
  return (
    <Pressable
      style={[styles.base, { backgroundColor }, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress ?? noop}
      onLongPress={onLongPress}
      delayLongPress={240}
    >
      <Text selectable={false} style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
