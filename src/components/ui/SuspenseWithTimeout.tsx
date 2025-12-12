import { useState, useEffect, Suspense, ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface SuspenseWithTimeoutProps {
    children: ReactNode;
    fallback?: ReactNode;
    timeout?: number;
}

export const SuspenseWithTimeout = ({
    children,
    fallback,
    timeout = 10000,
}: SuspenseWithTimeoutProps) => {
    const [showTimeout, setShowTimeout] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowTimeout(true), timeout);
        return () => clearTimeout(timer);
    }, [timeout]);

    return (
        <Suspense
            fallback={
                <div className="min-h-[200px] flex flex-col items-center justify-center">
                    {fallback || <Spinner size="lg" />}
                    {showTimeout && (
                        <p className="mt-3 text-sm text-muted-foreground animate-fade-in">
                            Loading is taking longer than expected...
                        </p>
                    )}
                </div>
            }
        >
            {children}
        </Suspense>
    );
};
