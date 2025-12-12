import { useAccessibility } from './AccessibilityProvider';

/**
 * useAnnounce - Convenience hook for screen reader announcements
 */
export const useAnnounce = () => {
    const { announce, screenReaderAnnouncements } = useAccessibility();

    return {
        announce,
        announcePolite: (message: string) => announce(message, 'polite'),
        announceAssertive: (message: string) => announce(message, 'assertive'),
        isEnabled: screenReaderAnnouncements,
    };
};
