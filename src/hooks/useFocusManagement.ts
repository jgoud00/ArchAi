import { useEffect } from 'react';

/**
 * useFocusManagement - Manage focus for accessibility
 * Ensures proper focus flow in dialogs and complex UI
 */
export const useFocusManagement = (isOpen: boolean, containerRef: React.RefObject<HTMLElement>) => {
    useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        // Focus first element when dialog opens
        firstFocusable?.focus();

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);

        return () => {
            container.removeEventListener('keydown', handleTabKey);
        };
    }, [isOpen, containerRef]);
};
