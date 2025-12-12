import { memo } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useAccessibility } from './AccessibilityProvider';

/**
 * AccessibilityQuickToggle - Compact toggle for header/toolbar
 */
export const AccessibilityQuickToggle = memo(() => {
    const { highContrast, toggleHighContrast } = useAccessibility();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleHighContrast}
            aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
            title={highContrast ? "Disable high contrast" : "Enable high contrast"}
            className="h-9 w-9"
        >
            <Eye className={cn(
                "h-4 w-4",
                highContrast && "text-primary"
            )} />
        </Button>
    );
});

AccessibilityQuickToggle.displayName = 'AccessibilityQuickToggle';
