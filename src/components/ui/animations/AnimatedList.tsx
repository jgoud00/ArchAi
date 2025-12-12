import { memo, ReactNode, Children, isValidElement, cloneElement } from 'react';
import { cn } from '@/utils/cn';

interface AnimatedListProps {
    children: ReactNode;
    className?: string;
    /** Delay between each item animation in milliseconds */
    staggerDelay?: number;
    /** Animation type */
    animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-right';
}

/**
 * AnimatedList - Staggered animation wrapper for lists and grids
 * 
 * Applies staggered fade-in animations to child elements.
 * Uses CSS custom properties for delay calculation (pure CSS, no JS timing).
 * Respects prefers-reduced-motion for accessibility.
 */
export const AnimatedList = memo(({
    children,
    className,
    staggerDelay = 50,
    animation = 'fade-up'
}: AnimatedListProps) => {
    const animationClass = {
        'fade-up': 'animate-stagger-fade-up',
        'fade-in': 'animate-stagger-fade-in',
        'scale-in': 'animate-stagger-scale-in',
        'slide-right': 'animate-stagger-slide-right',
    }[animation];

    return (
        <div className={cn("contents", className)}>
            {Children.map(children, (child, index) => {
                if (!isValidElement(child)) return child;

                return cloneElement(child as React.ReactElement<{ className?: string; style?: React.CSSProperties }>, {
                    className: cn(
                        (child.props as { className?: string }).className,
                        animationClass,
                        'motion-reduce:animate-none motion-reduce:opacity-100'
                    ),
                    style: {
                        ...(child.props as { style?: React.CSSProperties }).style,
                        '--stagger-delay': `${index * staggerDelay}ms`,
                    } as React.CSSProperties,
                });
            })}
        </div>
    );
});

AnimatedList.displayName = 'AnimatedList';
