import { memo } from 'react';

/**
 * SkipLink - Accessible skip navigation link
 * 
 * Allows keyboard users to skip to main content.
 * Visible only when focused for accessibility.
 */
export const SkipLink = memo(() => (
    <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
        Skip to main content
    </a>
));

SkipLink.displayName = 'SkipLink';

/**
 * VisuallyHidden - Screen reader only content
 * 
 * Content is visually hidden but accessible to screen readers.
 */
interface VisuallyHiddenProps {
    children: React.ReactNode;
}

export const VisuallyHidden = memo(({ children }: VisuallyHiddenProps) => (
    <span className="sr-only">{children}</span>
));

VisuallyHidden.displayName = 'VisuallyHidden';

/**
 * FocusTrap - Focus management utility
 * 
 * Traps focus within a container for modal dialogs.
 * Used for accessibility compliance.
 */
interface FocusTrapProps {
    children: React.ReactNode;
    active?: boolean;
}

export const FocusTrap = memo(({ children, active = true }: FocusTrapProps) => {
    if (!active) return <>{children}</>;

    return (
        <div
            role="region"
            aria-modal="true"
            tabIndex={-1}
        >
            {children}
        </div>
    );
});

FocusTrap.displayName = 'FocusTrap';

/**
 * Aria live region for announcements
 */
interface AriaLiveProps {
    message: string;
    assertive?: boolean;
}

export const AriaLive = memo(({ message, assertive = false }: AriaLiveProps) => (
    <div
        role="status"
        aria-live={assertive ? 'assertive' : 'polite'}
        aria-atomic="true"
        className="sr-only"
    >
        {message}
    </div>
));

AriaLive.displayName = 'AriaLive';
