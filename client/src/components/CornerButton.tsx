import { Pressable, Text, ViewStyle } from 'react-native';

import { cornerButtonStyles } from '@/types/cornerButton';

type CornerButtonProps = {
  label: string;
  accessibilityLabel?: string;
  backgroundColor: string;
  textColor: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onTouchEnd?: () => void;
  onTouchCancel?: () => void;
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
  onTouchEnd,
  onTouchCancel,
  style,
}: CornerButtonProps) {
  return (
    <Pressable
      style={[cornerButtonStyles.base, { backgroundColor }, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress ?? noop}
      onLongPress={onLongPress}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      delayLongPress={240}
    >
      <Text selectable={false} style={[cornerButtonStyles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}