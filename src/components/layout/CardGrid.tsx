import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardGridProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * CardGrid - Responsive grid layout for cards
 */
export const CardGrid = memo(({ children, cols = 3, gap = 'md', className }: CardGridProps) => {
    const colsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }[cols];

    const gapClass = {
        sm: 'gap-3',
        md: 'gap-4 md:gap-6',
        lg: 'gap-6 md:gap-8',
    }[gap];

    return (
        <div className={cn('grid', colsClass, gapClass, className)}>
            {children}
        </div>
    );
});

CardGrid.displayName = 'CardGrid';
