import { ViewStyle } from 'react-native';

import { CornerButton } from '@/components/CornerButton';

type SettingsButtonProps = {
  accessibilityLabel?: string;
  backgroundColor: string;
  textColor: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export function SettingsButton({
  accessibilityLabel,
  backgroundColor,
  textColor,
  onPress,
  style,
}: SettingsButtonProps) {
  return (
    <CornerButton
      label="Settings"
      accessibilityLabel={accessibilityLabel ?? "Settings button"}
      backgroundColor={backgroundColor}
      textColor={textColor}
      onPress={onPress}
      style={style}
    />
  );
}
