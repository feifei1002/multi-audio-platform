import React, { useRef, useState } from 'react';
import { View, Text, PanResponder, Dimensions } from 'react-native';
import { indexStyles } from '@/styles/indexScreen';

interface ProgressBarProps {
  theme: any;
  position: number;
  duration: number;
  onSeek: (newPosition: number) => void;
  onInteractionChange?: (isInteracting: boolean) => void;
}

export const ProgressBar = ({ theme, position, duration, onSeek, onInteractionChange }: ProgressBarProps) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const RNView = View as unknown as React.ComponentType<any>;
  const RNText = Text as unknown as React.ComponentType<any>;

  // Helper to format time
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate visual progress
  const displayPosition = isSeeking ? seekPosition : position;
  const progressRatio = duration > 0 ? displayPosition / duration : 0;
  const progressWidth = `${Math.min(Math.max(progressRatio, 0), 1) * 100}%`;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      
      onPanResponderGrant: () => {
        setIsSeeking(true);
        onInteractionChange?.(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const trackWidth = Dimensions.get('window').width * 0.85;
        // Adjust touchX based on the progress container's padding/alignment
        const touchX = gestureState.moveX - (Dimensions.get('window').width * 0.075);
        const ratio = Math.min(Math.max(touchX / trackWidth, 0), 1);
        setSeekPosition(Math.floor(ratio * duration));
      },
      onPanResponderRelease: (evt, gestureState) => {
        const trackWidth = Dimensions.get('window').width * 0.85;
        const touchX = gestureState.moveX - (Dimensions.get('window').width * 0.075);
        const ratio = Math.min(Math.max(touchX / trackWidth, 0), 1);
        const finalPosition = Math.floor(ratio * duration);
        
        setIsSeeking(false);
        onSeek(finalPosition);
        setTimeout(() => {
            onInteractionChange?.(false);
        }, 50); 
      },
      onPanResponderTerminate: () => {
        setIsSeeking(false);
        onInteractionChange?.(false);
      },
    })
  ).current;

  return (
    <RNView style={indexStyles.progressContainer}>
      <RNView
        style={{ height: 30, justifyContent: 'center', width: '100%', alignItems: 'center' }}
        {...panResponder.panHandlers}
      >
        <RNView style={[indexStyles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
          <RNView style={[indexStyles.progressFill, { backgroundColor: theme.text, width: progressWidth }]} />
          <RNView style={[indexStyles.progressThumb, { backgroundColor: theme.text, left: progressWidth }]} />
        </RNView>
      </RNView>

      <RNView style={indexStyles.progressMeta}>
        <RNText style={[indexStyles.metaText, { color: theme.textSecondary }]}>
          {formatTime(displayPosition)}
        </RNText>
        <RNText style={[indexStyles.metaText, { color: theme.textSecondary }]}>
          {formatTime(duration)}
        </RNText>
      </RNView>
    </RNView>
  );
};