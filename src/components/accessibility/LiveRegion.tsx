import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface LiveRegionProps {
    children: ReactNode;
    priority?: 'polite' | 'assertive';
    atomic?: boolean;
    visible?: boolean;
    className?: string;
}

/**
 * LiveRegion - Announces dynamic content to screen readers
 */
export const LiveRegion = memo(({
    children,
    priority = 'polite',
    atomic = true,
    visible = false,
    className,
}: LiveRegionProps) => (
    <div
        role={priority === 'assertive' ? 'alert' : 'status'}
        aria-live={priority}
        aria-atomic={atomic}
        className={cn(
            visible ? '' : 'sr-only',
            className
        )}
    >
        {children}
    </div>
));

LiveRegion.displayName = 'LiveRegion';
