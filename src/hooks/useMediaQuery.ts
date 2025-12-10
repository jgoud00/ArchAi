import { useEffect, useState } from 'react'

/**
 * Custom hook to detect media query matches.
 * Useful for responsive design decisions.
 * 
 * @param query - CSS media query string
 * @returns boolean indicating if the query matches
 */
export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)

        // Set initial value
        if (media.matches !== matches) {
            setMatches(media.matches)
        }

        // Create listener
        const listener = (e: MediaQueryListEvent) => setMatches(e.matches)

        // Modern browsers
        if (media.addEventListener) {
            media.addEventListener('change', listener)
            return () => media.removeEventListener('change', listener)
        }
        // Fallback for older browsers
        else {
            media.addListener(listener)
            return () => media.removeListener(listener)
        }
    }, [matches, query])

    return matches
}

// Convenience hooks for common breakpoints
export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')
