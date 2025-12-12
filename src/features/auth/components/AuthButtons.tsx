import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import { GoogleLogo } from '@/components/ui/GoogleLogo';

interface AuthDividerProps {
    text?: string;
}

/**
 * AuthDivider - Visual divider with text for auth forms
 */
export const AuthDivider = memo(({ text = 'Or continue with' }: AuthDividerProps) => {
    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card/50 text-muted-foreground backdrop-blur-xl">{text}</span>
            </div>
        </div>
    );
});

AuthDivider.displayName = 'AuthDivider';

interface GoogleAuthButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

/**
 * GoogleAuthButton - Google OAuth button for auth forms
 */
export const GoogleAuthButton = memo(({ onClick, isLoading }: GoogleAuthButtonProps) => {
    return (
        <Button
            type="button"
            variant="outline"
            onClick={onClick}
            disabled={isLoading}
            className="w-full py-3 bg-background/5 border-border text-muted-foreground hover:bg-background/10 hover:text-foreground hover:border-border/20 rounded-xl transition-all"
        >
            <GoogleLogo className="h-5 w-5 mr-3" /> Google
        </Button>
    );
});

GoogleAuthButton.displayName = 'GoogleAuthButton';
