import { ViewStyle } from 'react-native';

import { CornerButton } from '@/components/CornerButton';

type ContentsSwitchButtonProps = {
  accessibilityLabel?: string;
  backgroundColor: string;
  textColor: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
};

export function ContentsSwitchButton({
  accessibilityLabel,
  backgroundColor,
  textColor,
  onPress,
  onLongPress,
  style,
}: ContentsSwitchButtonProps) {
  return (
    <CornerButton
      label="Contents"
      accessibilityLabel={accessibilityLabel ?? "Contents switch button"}
      backgroundColor={backgroundColor}
      textColor={textColor}
      onPress={onPress}
      onLongPress={onLongPress}
      style={style}
    />
  );
}
