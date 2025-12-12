import { memo, ReactNode } from 'react';
import { Logo } from '@/components/ui/Logo';

interface AuthFormCardProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer?: ReactNode;
}

/**
 * AuthFormCard - Card container for auth forms with logo and title
 */
export const AuthFormCard = memo(({ title, subtitle, children, footer }: AuthFormCardProps) => {
    return (
        <div className="max-w-md w-full space-y-8 bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-2xl">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <Logo className="h-10 w-auto" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {children}

            {footer && (
                <div className="text-center text-sm text-muted-foreground">
                    {footer}
                </div>
            )}
        </div>
    );
});

AuthFormCard.displayName = 'AuthFormCard';
