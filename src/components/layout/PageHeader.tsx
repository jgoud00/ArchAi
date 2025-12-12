import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { textStyles } from '@/styles/designTokens';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

/**
 * PageHeader - Standardized page header with title, description, and actions
 */
export const PageHeader = memo(({ title, description, actions, className }: PageHeaderProps) => {
    return (
        <header className={cn('flex flex-col md:flex-row justify-between items-start md:items-center gap-4', className)}>
            <div>
                <h1 className={cn(textStyles.h1, 'text-foreground')}>{title}</h1>
                {description && (
                    <p className={cn(textStyles.small, 'mt-1')}>{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </header>
    );
});

PageHeader.displayName = 'PageHeader';
