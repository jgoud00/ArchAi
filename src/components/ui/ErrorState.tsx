import { memo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface ErrorStateProps {
    error?: Error | string;
    title?: string;
    description?: string;
    retry?: () => void;
    fallback?: ReactNode;
    className?: string;
}

/**
 * ErrorState - Reusable error state component
 * Used when an error occurs during data fetching or operations
 */
export const ErrorState = memo(({
    error,
    title = 'Something went wrong',
    description,
    retry,
    fallback,
    className
}: ErrorStateProps) => {
    // If there's a custom fallback, use it
    if (fallback) {
        return <>{fallback}</>;
    }

    const errorMessage = error instanceof Error ? error.message : error;
    const displayDescription = description || errorMessage || 'An unexpected error occurred. Please try again.';

    return (
        <div className={cn(
            'glass border border-destructive/20 p-12 rounded-xl text-center',
            className
        )}>
            <div className="h-16 w-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {displayDescription}
            </p>
            {retry && (
                <Button onClick={retry} variant="outline">
                    Try Again
                </Button>
            )}
        </div>
    );
});

ErrorState.displayName = 'ErrorState';
