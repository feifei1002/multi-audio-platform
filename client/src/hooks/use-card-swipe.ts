import { useMemo } from "react";
import { PanResponder } from "react-native";

interface SwipeConfig {
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    threshold?: number;
}

export function useCardSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeConfig) {
    const panResponder = useMemo(() =>
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > threshold) {
                    onSwipeRight();
                } else if (gestureState.dx < -threshold) {
                    onSwipeLeft();
                }
            },
        }), [onSwipeLeft, onSwipeRight, threshold]);

    return panResponder.panHandlers;
}