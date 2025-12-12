import { memo, useState, useEffect, useRef, ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoadingStateProps {
    loading: boolean;
    error?: string | null;
    onRetry?: () => void;
    children: ReactNode;
    loadingFallback?: ReactNode;
    minLoadingTime?: number;
    timeoutWarning?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingState = memo(({
    loading,
    error,
    onRetry,
    children,
    loadingFallback,
    minLoadingTime = 0,
    timeoutWarning = 10000,
    size = 'md',
    className,
}: LoadingStateProps) => {
    const [showTimeout, setShowTimeout] = useState(false);
    const [delayedLoading, setDelayedLoading] = useState(loading);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        if (loading) {
            startTimeRef.current = Date.now();
            setDelayedLoading(true);
        } else {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, minLoadingTime - elapsed);
            if (remaining > 0) {
                const timer = setTimeout(() => setDelayedLoading(false), remaining);
                return () => clearTimeout(timer);
            }
            setDelayedLoading(false);
        }
    }, [loading, minLoadingTime]);

    useEffect(() => {
        if (!loading) {
            setShowTimeout(false);
            return;
        }
        const timer = setTimeout(() => setShowTimeout(true), timeoutWarning);
        return () => clearTimeout(timer);
    }, [loading, timeoutWarning]);

    if (error) {
        const sizeClasses = size === 'sm' ? 'p-4' : size === 'lg' ? 'p-8' : 'p-6';
        const iconSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';

        return (
            <div className={cn("flex flex-col items-center justify-center text-center", sizeClasses, className)}>
                <AlertTriangle className={cn("text-destructive mb-3", iconSize)} />
                <p className="text-sm text-muted-foreground mb-3">{error}</p>
                {onRetry && (
                    <Button size="sm" variant="outline" onClick={onRetry}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                )}
            </div>
        );
    }

    if (delayedLoading) {
        if (loadingFallback) return <>{loadingFallback}</>;

        const sizeClasses = size === 'sm' ? 'p-4' : size === 'lg' ? 'p-8' : 'p-6';

        return (
            <div className={cn("flex flex-col items-center justify-center", sizeClasses, className)}>
                <Spinner size={size} />
                {showTimeout && (
                    <p className="mt-3 text-sm text-muted-foreground animate-fade-in">
                        Loading is taking longer than expected...
                    </p>
                )}
            </div>
        );
    }

    return <>{children}</>;
});

LoadingState.displayName = 'LoadingState';
