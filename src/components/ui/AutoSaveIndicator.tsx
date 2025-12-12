import { memo, useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

interface AutoSaveIndicatorProps {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date | null;
    errorMessage?: string;
    className?: string;
}

export const AutoSaveIndicator = memo(({
    status,
    lastSaved,
    errorMessage,
    className
}: AutoSaveIndicatorProps) => {
    const [timeAgo, setTimeAgo] = useState<string>('');

    useEffect(() => {
        if (!lastSaved) return;

        const updateTimeAgo = () => {
            setTimeAgo(formatDistanceToNow(lastSaved, { addSuffix: true }));
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 10000);
        return () => clearInterval(interval);
    }, [lastSaved]);

    const statusConfig = {
        idle: { icon: null, text: '', color: 'text-muted-foreground' },
        saving: {
            icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
            text: 'Saving...',
            color: 'text-muted-foreground'
        },
        saved: {
            icon: <Check className="h-3.5 w-3.5" />,
            text: lastSaved ? `Saved ${timeAgo}` : 'Saved',
            color: 'text-green-600'
        },
        error: {
            icon: <AlertCircle className="h-3.5 w-3.5" />,
            text: errorMessage || 'Save failed',
            color: 'text-red-500'
        },
    };

    const config = statusConfig[status];
    if (status === 'idle') return null;

    return (
        <div
            className={cn("flex items-center gap-1.5 text-xs transition-opacity duration-300", config.color, className)}
            role="status"
            aria-live="polite"
        >
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
});

AutoSaveIndicator.displayName = 'AutoSaveIndicator';
