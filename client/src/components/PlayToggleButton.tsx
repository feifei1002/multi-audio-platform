import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { CornerButton } from '@/components/CornerButton';
import { playToggleButtonStyles } from '@/types/playToggleButton';

type PlayToggleButtonProps = {
  isPlaying: boolean;
  accessibilityLabel?: string;
  backgroundColor: string;
  textColor: string;
  onPress?: () => void;
  volume: number;
  onVolumeChange?: (nextVolume: number) => void;
  onTrackSwitch?: (direction: 'previous' | 'next') => void;
  style?: ViewStyle;
};

const JOYSTICK_RANGE = 40;
const VOLUME_ACTIVATION_DY = 10;
const TRACK_ACTIVATION_DX = 10;
const MAX_VOLUME_RATE_PER_SECOND = 60;

const clampVolume = (nextVolume: number) => {
  return Math.max(0, Math.min(100, nextVolume));
};

export function PlayToggleButton({
  isPlaying,
  accessibilityLabel,
  backgroundColor,
  textColor,
  onPress,
  volume,
  onVolumeChange,
  onTrackSwitch,
  style,
}: PlayToggleButtonProps) {
  const label = isPlaying ? 'Pause' : 'Play';
  const [isVolumeBarVisible, setIsVolumeBarVisible] = useState(false);
  const [trackHint, setTrackHint] = useState('');
  const suppressTapRef = useRef(false);
  const isLongPressActiveRef = useRef(false);
  const isVolumeModeActiveRef = useRef(false);
  const isTrackModeActiveRef = useRef(false);
  const pendingTrackRef = useRef<'previous' | 'next' | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentVolumeRef = useRef(volume);
  const stickDyRef = useRef(0);
  const stickDxRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const frameTsRef = useRef<number | null>(null);
  const stickX = useRef(new Animated.Value(0)).current;
  const stickY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    currentVolumeRef.current = volume;
  }, [volume]);

  const stopVolumeLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    frameTsRef.current = null;
  };

  const clearHintTimeout = () => {
    if (hintTimeoutRef.current !== null) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
  };

  const startVolumeLoop = () => {
    stopVolumeLoop();

    const tick = (timestamp: number) => {
      if (!isVolumeModeActiveRef.current) {
        stopVolumeLoop();
        return;
      }

      if (frameTsRef.current === null) {
        frameTsRef.current = timestamp;
      }

      const deltaSeconds = Math.min(0.05, Math.max(0.001, (timestamp - frameTsRef.current) / 1000));
      frameTsRef.current = timestamp;

      const dy = stickDyRef.current;
      const direction = dy < 0 ? 1 : dy > 0 ? -1 : 0;
      const intensity = Math.min(1, Math.abs(dy) / JOYSTICK_RANGE);

      if (direction !== 0 && intensity > 0) {
        const ratePerSecond = MAX_VOLUME_RATE_PER_SECOND * intensity;
        const deltaVolume = direction * ratePerSecond * deltaSeconds;
        const nextVolume = clampVolume(currentVolumeRef.current + deltaVolume);
        currentVolumeRef.current = nextVolume;
        onVolumeChange?.(Math.round(nextVolume));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const finishInteraction = () => {
    const shouldSwitchTrack = isTrackModeActiveRef.current;
    const trackDirection = pendingTrackRef.current;

    isLongPressActiveRef.current = false;
    isVolumeModeActiveRef.current = false;
    isTrackModeActiveRef.current = false;
    pendingTrackRef.current = null;
    stickDyRef.current = 0;
    stickDxRef.current = 0;
    stopVolumeLoop();
    setIsVolumeBarVisible(false);
    clearHintTimeout();

    if (shouldSwitchTrack && trackDirection) {
      onTrackSwitch?.(trackDirection);
      setTrackHint(trackDirection === 'next' ? 'Switched to next track' : 'Switched to previous track');
      hintTimeoutRef.current = setTimeout(() => {
        setTrackHint('');
      }, 800);
    } else {
      setTrackHint('');
    }

    Animated.spring(stickX, { toValue: 0, useNativeDriver: true }).start();
    Animated.spring(stickY, { toValue: 0, useNativeDriver: true }).start();
  };

  useEffect(() => {
    return () => {
      stopVolumeLoop();
      clearHintTimeout();
    };
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!isLongPressActiveRef.current) {
            return false;
          }

          return Math.abs(gestureState.dy) > 2 || Math.abs(gestureState.dx) > 2;
        },
        onPanResponderMove: (_, gestureState) => {
          if (!isLongPressActiveRef.current) {
            return;
          }

          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);

          if (!isVolumeModeActiveRef.current && !isTrackModeActiveRef.current) {
            if (absDy >= VOLUME_ACTIVATION_DY && absDy >= absDx) {
              isVolumeModeActiveRef.current = true;
              setIsVolumeBarVisible(true);
              setTrackHint('');
              startVolumeLoop();
            } else if (absDx >= TRACK_ACTIVATION_DX && absDx > absDy) {
              isTrackModeActiveRef.current = true;
              setIsVolumeBarVisible(false);
              setTrackHint('Drag left/right then release to switch track');
            } else {
              return;
            }
          }

          if (isTrackModeActiveRef.current) {
            const clampedDx = Math.max(-JOYSTICK_RANGE, Math.min(JOYSTICK_RANGE, gestureState.dx));
            stickDxRef.current = clampedDx;
            stickX.setValue(clampedDx);

            if (Math.abs(clampedDx) >= TRACK_ACTIVATION_DX) {
              const direction = clampedDx > 0 ? 'next' : 'previous';
              pendingTrackRef.current = direction;
              setTrackHint(direction === 'next' ? 'Release to switch to next track' : 'Release to switch to previous track');
            } else {
              pendingTrackRef.current = null;
              setTrackHint('Drag left/right then release to switch track');
            }

            return;
          }

          const clampedDy = Math.max(-JOYSTICK_RANGE, Math.min(JOYSTICK_RANGE, gestureState.dy));
          stickDyRef.current = clampedDy;
          stickY.setValue(clampedDy);
        },
        onPanResponderRelease: () => {
          finishInteraction();
        },
        onPanResponderTerminate: () => {
          finishInteraction();
        },
      }),
    [stickY],
  );

  const handlePress = () => {
    if (suppressTapRef.current) {
      suppressTapRef.current = false;
      return;
    }

    onPress?.();
  };

  const handleLongPress = () => {
    suppressTapRef.current = true;
    isLongPressActiveRef.current = true;
    isVolumeModeActiveRef.current = false;
    isTrackModeActiveRef.current = false;
    pendingTrackRef.current = null;
    currentVolumeRef.current = volume;
    stickDyRef.current = 0;
    stickDxRef.current = 0;
    stickX.setValue(0);
    stickY.setValue(0);
    setIsVolumeBarVisible(false);
    setTrackHint('Drag up/down for volume, left/right for track');
  };

  const handleTouchEnd = () => {
    if (isLongPressActiveRef.current || isVolumeBarVisible) {
      finishInteraction();
    }
  };

  return (
    <View style={[playToggleButtonStyles.container, style]} {...panResponder.panHandlers}>
      {isVolumeBarVisible ? (
        <View style={[playToggleButtonStyles.miniTrackVertical, { backgroundColor }]}>
          <View style={[playToggleButtonStyles.miniFillVertical, { height: `${volume}%`, backgroundColor: textColor }]} />
        </View>
      ) : null}

      <Animated.View style={[playToggleButtonStyles.joystick, { transform: [{ translateX: stickX }, { translateY: stickY }] }]}>
        <CornerButton
          label={label}
          accessibilityLabel={accessibilityLabel ?? `${label} toggle button`}
          backgroundColor={backgroundColor}
          textColor={textColor}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />
      </Animated.View>

      {trackHint ? (
        <View style={playToggleButtonStyles.trackHintWrap}>
          <Text selectable={false} style={[playToggleButtonStyles.trackHintText, { color: textColor }]}>{trackHint}</Text>
        </View>
      ) : null}
    </View>
  );
}

