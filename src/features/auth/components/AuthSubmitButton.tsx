import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface AuthSubmitButtonProps {
    isLoading: boolean;
    loadingText: string;
    submitText: string;
}

/**
 * AuthSubmitButton - Gradient submit button for auth forms
 */
export const AuthSubmitButton = memo(({ isLoading, loadingText, submitText }: AuthSubmitButtonProps) => {
    return (
        <Button
            type="submit"
            disabled={isLoading}
            ripple={!isLoading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {isLoading ? loadingText : submitText}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
    );
});

AuthSubmitButton.displayName = 'AuthSubmitButton';
