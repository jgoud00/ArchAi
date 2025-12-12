import { useRef, useCallback } from 'react';

interface SwipeHandlers {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}

/**
 * useSwipeGesture - Hook for touch swipe detection
 */
export const useSwipeGesture = (handlers: SwipeHandlers, threshold = 50) => {
    const startX = useRef(0);
    const startY = useRef(0);

    const onTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
        // Handle both React synthetic events and native DOM events
        const touch = 'touches' in e ? e.touches[0] : (e as any).touches[0];
        startX.current = touch.clientX;
        startY.current = touch.clientY;
    }, []);

    const onTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
        const touch = 'changedTouches' in e ? e.changedTouches[0] : (e as any).changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;

        const deltaX = endX - startX.current;
        const deltaY = endY - startY.current;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Determine primary direction
        if (absX > absY && absX > threshold) {
            if (deltaX > 0) {
                handlers.onSwipeRight?.();
            } else {
                handlers.onSwipeLeft?.();
            }
        } else if (absY > absX && absY > threshold) {
            if (deltaY > 0) {
                handlers.onSwipeDown?.();
            } else {
                handlers.onSwipeUp?.();
            }
        }
    }, [handlers, threshold]);

    return { onTouchStart, onTouchEnd };
};
