import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

/**
 * PageTransition - Smooth fade/slide animation wrapper for page content
 * 
 * Respects prefers-reduced-motion for accessibility.
 * Uses GPU-accelerated transform and opacity for performance.
 */
export const PageTransition = memo(({ children, className }: PageTransitionProps) => {
    return (
        <div
            className={cn(
                "animate-page-enter motion-reduce:animate-none",
                className
            )}
        >
            {children}
        </div>
    );
});

PageTransition.displayName = 'PageTransition';
