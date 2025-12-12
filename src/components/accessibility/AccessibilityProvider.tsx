import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
    memo
} from 'react';


// ============================================
// ACCESSIBILITY CONTEXT
// ============================================

interface AccessibilityState {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReaderAnnouncements: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
    toggleReducedMotion: () => void;
    toggleHighContrast: () => void;
    toggleAnnouncements: () => void;
    announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const STORAGE_KEY = 'archai-accessibility-prefs';

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

/**
 * AccessibilityProvider - Global accessibility settings provider
 */
export const AccessibilityProvider = memo(({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AccessibilityState>(() => {
        // Load from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // Ignore parse errors
            }
        }

        // Detect system preferences
        return {
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            highContrast: window.matchMedia('(prefers-contrast: more)').matches,
            screenReaderAnnouncements: true,
        };
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Apply reduced motion class to body
    useEffect(() => {
        if (state.reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
    }, [state.reducedMotion]);

    // Apply high contrast class to body
    useEffect(() => {
        if (state.highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [state.highContrast]);

    const toggleReducedMotion = useCallback(() => {
        setState(s => ({ ...s, reducedMotion: !s.reducedMotion }));
    }, []);

    const toggleHighContrast = useCallback(() => {
        setState(s => ({ ...s, highContrast: !s.highContrast }));
    }, []);

    const toggleAnnouncements = useCallback(() => {
        setState(s => ({ ...s, screenReaderAnnouncements: !s.screenReaderAnnouncements }));
    }, []);

    // Screen reader announcement function
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (!state.screenReaderAnnouncements) return;

        const announcer = document.getElementById(`sr-announcer-${priority}`);
        if (announcer) {
            // Clear and set to trigger announcement
            announcer.textContent = '';
            setTimeout(() => {
                announcer.textContent = message;
            }, 50);
        }
    }, [state.screenReaderAnnouncements]);

    return (
        <AccessibilityContext.Provider value={{
            ...state,
            toggleReducedMotion,
            toggleHighContrast,
            toggleAnnouncements,
            announce,
        }}>
            {/* Live region announcers */}
            <div
                id="sr-announcer-polite"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            />
            <div
                id="sr-announcer-assertive"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
            />
            {children}
        </AccessibilityContext.Provider>
    );
});

AccessibilityProvider.displayName = 'AccessibilityProvider';

/**
 * useAccessibility - Hook to access accessibility state and controls
 */
export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};


