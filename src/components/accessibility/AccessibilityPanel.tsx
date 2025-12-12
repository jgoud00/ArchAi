import { memo } from 'react';
import { Sun, Eye, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAccessibility } from './AccessibilityProvider';

interface AccessibilityPanelProps {
    className?: string;
}

/**
 * AccessibilityPanel - UI for accessibility settings
 */
export const AccessibilityPanel = memo(({ className }: AccessibilityPanelProps) => {
    const {
        reducedMotion,
        highContrast,
        screenReaderAnnouncements,
        toggleReducedMotion,
        toggleHighContrast,
        toggleAnnouncements,
    } = useAccessibility();

    return (
        <div className={cn("space-y-4", className)}>
            <h3 className="font-semibold text-foreground">Accessibility</h3>

            <div className="space-y-3">
                {/* Reduced Motion */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            reducedMotion ? "bg-primary/20" : "bg-muted"
                        )}>
                            <Eye className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Reduced Motion</p>
                            <p className="text-xs text-muted-foreground">Minimize animations</p>
                        </div>
                    </div>
                    <ToggleSwitch checked={reducedMotion} onChange={toggleReducedMotion} />
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            highContrast ? "bg-primary/20" : "bg-muted"
                        )}>
                            <Sun className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">High Contrast</p>
                            <p className="text-xs text-muted-foreground">Increase color contrast</p>
                        </div>
                    </div>
                    <ToggleSwitch checked={highContrast} onChange={toggleHighContrast} />
                </div>

                {/* Screen Reader Announcements */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            screenReaderAnnouncements ? "bg-primary/20" : "bg-muted"
                        )}>
                            {screenReaderAnnouncements ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </div>
                        <div>
                            <p className="text-sm font-medium">Live Announcements</p>
                            <p className="text-xs text-muted-foreground">Screen reader updates</p>
                        </div>
                    </div>
                    <ToggleSwitch checked={screenReaderAnnouncements} onChange={toggleAnnouncements} />
                </div>
            </div>
        </div>
    );
});

AccessibilityPanel.displayName = 'AccessibilityPanel';

// Helper component
interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    label?: string;
}

const ToggleSwitch = memo(({ checked, onChange, label }: ToggleSwitchProps) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            checked ? "bg-primary" : "bg-muted"
        )}
    >
        <span
            className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                checked ? "translate-x-6" : "translate-x-1"
            )}
        />
    </button>
));

ToggleSwitch.displayName = 'ToggleSwitch';
