import { useState, useEffect, useRef } from 'react';

interface UseAnimatedCounterOptions {
    /** Duration of the animation in milliseconds */
    duration?: number;
    /** Easing function */
    easing?: 'linear' | 'easeOut' | 'easeInOut';
    /** Delay before starting animation */
    delay?: number;
    /** Decimal places to show */
    decimals?: number;
    /** Prefix (e.g., "$") */
    prefix?: string;
    /** Suffix (e.g., "%") */
    suffix?: string;
}

const easingFunctions = {
    linear: (t: number) => t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * useAnimatedCounter - Animates a number from 0 to target value
 * 
 * @param targetValue - The final value to animate to
 * @param options - Animation configuration options
 * @returns Formatted string with animated value
 */
export const useAnimatedCounter = (
    targetValue: number,
    options: UseAnimatedCounterOptions = {}
): string => {
    const {
        duration = 1000,
        easing = 'easeOut',
        delay = 0,
        decimals = 0,
        prefix = '',
        suffix = '',
    } = options;

    const [displayValue, setDisplayValue] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const previousTargetRef = useRef(targetValue);

    useEffect(() => {
        // Reset if target changes
        const startValue = previousTargetRef.current !== targetValue ? displayValue : 0;
        previousTargetRef.current = targetValue;

        const easingFn = easingFunctions[easing];

        const animate = (currentTime: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = currentTime;
            }

            const elapsed = currentTime - startTimeRef.current - delay;

            if (elapsed < 0) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFn(progress);
            const currentValue = startValue + (targetValue - startValue) * easedProgress;

            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        startTimeRef.current = null;
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [targetValue, duration, easing, delay]);

    const formattedValue = displayValue.toFixed(decimals);

    // Add thousand separators
    const parts = formattedValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${prefix}${parts.join('.')}${suffix}`;
};

/**
 * useInView - Simple intersection observer hook
 */
export const useInView = (options: IntersectionObserverInit = {}) => {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect(); // Only trigger once
                }
            },
            { threshold: 0.1, ...options }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return { ref, isInView };
};
