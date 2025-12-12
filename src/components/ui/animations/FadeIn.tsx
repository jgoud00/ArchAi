import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface FadeInProps {
    children: ReactNode;
    className?: string;
    /** Delay before animation starts in milliseconds */
    delay?: number;
    /** Animation direction */
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    /** Animation duration in milliseconds */
    duration?: number;
}

/**
 * FadeIn - Simple fade-in animation wrapper
 * 
 * Wraps content in a fade-in animation with optional direction.
 * Respects prefers-reduced-motion for accessibility.
 */
export const FadeIn = memo(({
    children,
    className,
    delay = 0,
    direction = 'up',
    duration = 300
}: FadeInProps) => {
    const directionClass = {
        up: 'animate-fade-in-up',
        down: 'animate-fade-in-down',
        left: 'animate-fade-in-left',
        right: 'animate-fade-in-right',
        none: 'animate-fade-in',
    }[direction];

    return (
        <div
            className={cn(
                directionClass,
                'motion-reduce:animate-none motion-reduce:opacity-100',
                className
            )}
            style={{
                animationDelay: `${delay}ms`,
                animationDuration: `${duration}ms`,
            }}
        >
            {children}
        </div>
    );
});

FadeIn.displayName = 'FadeIn';
