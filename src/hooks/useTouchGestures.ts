import { useEffect, useCallback, useRef } from 'react';

interface TouchGesturesOptions {
    onPinch?: (scale: number, centerX: number, centerY: number) => void;
    onRotate?: (angle: number, centerX: number, centerY: number) => void;
    onPan?: (deltaX: number, deltaY: number) => void;
    onLongPress?: (x: number, y: number) => void;
    onDoubleTap?: (x: number, y: number) => void;
}

/**
 * useTouchGestures - Handle multi-touch gestures for mobile CAD
 * Supports: pinch zoom, rotate, pan, long press, double tap
 */
export const useTouchGestures = ({
    onPinch,
    onRotate,
    onPan,
    onLongPress,
    onDoubleTap,
}: TouchGesturesOptions) => {
    // Track touch state using refs to persist across renders without causing re-renders
    const touchesRef = useRef<Touch[]>([]);
    const initialDistanceRef = useRef(0);
    const initialAngleRef = useRef(0);
    const lastTapTimeRef = useRef(0);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getDistance = (touch1: Touch, touch2: Touch) => {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getAngle = (touch1: Touch, touch2: Touch) => {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    };

    const getCenter = (touch1: Touch, touch2: Touch) => {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
        };
    };

    const handleTouchStart = useCallback((e: TouchEvent) => {
        touchesRef.current = Array.from(e.touches);
        const touches = touchesRef.current;

        if (touches.length === 2) {
            // Two-finger gesture (pinch/rotate)
            initialDistanceRef.current = getDistance(touches[0], touches[1]);
            initialAngleRef.current = getAngle(touches[0], touches[1]);
        } else if (touches.length === 1) {
            // Single touch - check for long press or double tap
            const now = Date.now();
            const touch = touches[0];

            // Double tap detection
            if (now - lastTapTimeRef.current < 300 && onDoubleTap) {
                onDoubleTap(touch.clientX, touch.clientY);
                lastTapTimeRef.current = 0; // Reset
            } else {
                lastTapTimeRef.current = now;
            }

            // Long press detection
            if (onLongPress) {
                longPressTimerRef.current = setTimeout(() => {
                    onLongPress(touch.clientX, touch.clientY);
                }, 500);
            }
        }
    }, [onDoubleTap, onLongPress]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        const currentTouches = Array.from(e.touches);
        const touches = touchesRef.current;

        if (currentTouches.length === 2 && touches.length === 2) {
            const currentDistance = getDistance(currentTouches[0], currentTouches[1]);
            const currentAngle = getAngle(currentTouches[0], currentTouches[1]);
            const center = getCenter(currentTouches[0], currentTouches[1]);

            // Pinch zoom
            if (onPinch && initialDistanceRef.current > 0) {
                const scale = currentDistance / initialDistanceRef.current;
                onPinch(scale, center.x, center.y);
            }

            // Rotation
            if (onRotate && initialAngleRef.current !== 0) {
                const angleDelta = currentAngle - initialAngleRef.current;
                onRotate(angleDelta, center.x, center.y);
            }

            initialDistanceRef.current = currentDistance;
            initialAngleRef.current = currentAngle;
        } else if (currentTouches.length === 2 && onPan) {
            // Two-finger pan
            if (touches.length === 2) {
                const prevCenter = getCenter(touches[0], touches[1]);
                const currCenter = getCenter(currentTouches[0], currentTouches[1]);
                const deltaX = currCenter.x - prevCenter.x;
                const deltaY = currCenter.y - prevCenter.y;
                onPan(deltaX, deltaY);
            }
        }

        touchesRef.current = currentTouches;
    }, [onPinch, onRotate, onPan]);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        touchesRef.current = [];
        initialDistanceRef.current = 0;
        initialAngleRef.current = 0;
    }, []);

    useEffect(() => {
        const element = document.body;

        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd);
        element.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
};
