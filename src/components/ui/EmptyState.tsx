import { memo, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

/**
 * EmptyState - Reusable empty state component
 * Used when there's no data to display (no projects, no files, etc.)
 */
export const EmptyState = memo(({ icon, title, description, action, className }: EmptyStateProps) => {
    return (
        <div className={cn(
            'glass-dark border border-dashed border-border/50 p-12 rounded-xl text-center relative overflow-hidden group',
            className
        )}>
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
                {description && (
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {description}
                    </p>
                )}
                {action && <div>{action}</div>}
            </div>
        </div>
    );
});

EmptyState.displayName = 'EmptyState';
