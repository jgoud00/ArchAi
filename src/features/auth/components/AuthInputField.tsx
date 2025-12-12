import { memo, forwardRef, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface AuthInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    icon: LucideIcon;
    error?: string;
}

/**
 * AuthInputField - Input field with icon for auth forms
 */
export const AuthInputField = memo(forwardRef<HTMLInputElement, AuthInputFieldProps>(
    ({ icon: Icon, error, className = '', ...props }, ref) => {
        return (
            <div className="space-y-1">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        ref={ref}
                        className={`block w-full pl-11 pr-4 py-3 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all ${error ? 'border-destructive animate-shake' : ''} ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
            </div>
        );
    }
));

AuthInputField.displayName = 'AuthInputField';
