import { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthVisualPanelProps {
    icon: LucideIcon;
    stat: string;
    statLabel: string;
    quote: string;
    authorInitials: string;
    authorName: string;
    authorTitle: string;
    gradient?: string;
    rotate?: 'left' | 'right';
}

/**
 * AuthVisualPanel - Visual branding panel for auth pages
 */
export const AuthVisualPanel = memo(({
    icon: Icon,
    stat,
    statLabel,
    quote,
    authorInitials,
    authorName,
    authorTitle,
    gradient = 'from-cyan-400 to-blue-500',
    rotate = 'left'
}: AuthVisualPanelProps) => {
    const rotateClass = rotate === 'left' ? '-rotate-3' : 'rotate-3';

    return (
        <>
            <div className="mb-8 relative inline-block">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className={`relative bg-card/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-2xl transform ${rotateClass} hover:rotate-0 transition-transform duration-500`}>
                    <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <div className="text-2xl font-bold text-foreground mb-2">{stat}</div>
                    <div className="text-muted-foreground text-sm">{statLabel}</div>
                </div>
            </div>

            <blockquote className="text-xl font-medium text-muted-foreground leading-relaxed mb-6">
                "{quote}"
            </blockquote>

            <div className="flex items-center justify-center space-x-4">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold`}>
                    {authorInitials}
                </div>
                <div className="text-left">
                    <div className="text-foreground font-semibold">{authorName}</div>
                    <div className="text-primary text-sm">{authorTitle}</div>
                </div>
            </div>
        </>
    );
});

AuthVisualPanel.displayName = 'AuthVisualPanel';
