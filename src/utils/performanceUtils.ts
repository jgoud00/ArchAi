/**
 * Performance Utilities for optimizing rendering
 */

import { useRef, useEffect, useState } from 'react';

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * useDebounce hook
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * useThrottle hook
 */
export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= limit) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, limit - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit]);

    return throttledValue;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement, viewport: DOMRect): boolean {
    const rect = element.getBoundingClientRect();

    return (
        rect.left < viewport.right &&
        rect.right > viewport.left &&
        rect.top < viewport.bottom &&
        rect.bottom > viewport.top
    );
}

/**
 * Request animation frame with fallback
 */
export const requestFrame = (
    typeof window !== 'undefined' && window.requestAnimationFrame
) ? window.requestAnimationFrame.bind(window)
    : (callback: FrameRequestCallback) => setTimeout(callback, 16);

export const cancelFrame = (
    typeof window !== 'undefined' && window.cancelAnimationFrame
) ? window.cancelAnimationFrame.bind(window)
    : clearTimeout;
