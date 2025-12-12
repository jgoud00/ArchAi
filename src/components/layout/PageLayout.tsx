import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { layout } from '@/styles/designTokens';

interface PageLayoutProps {
    children: ReactNode;
    className?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

/**
 * PageLayout - Standard page wrapper with consistent padding and max-width
 */
export const PageLayout = memo(({ children, className, maxWidth }: PageLayoutProps) => {
    const maxWidthClass = maxWidth === 'full' ? 'w-full' : layout.maxWidth[maxWidth || '7xl'];

    return (
        <div className={cn(layout.pagePadding, 'mx-auto', maxWidthClass, className)}>
            {children}
        </div>
    );
});

PageLayout.displayName = 'PageLayout';
