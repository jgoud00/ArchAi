/**
 * Keyboard Shortcuts Hook
 * 
 * Provides global keyboard shortcuts for common actions
 * Press Ctrl+K to open search, Esc to close modals, etc.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const useKeyboardShortcuts = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input/textarea
            const target = e.target as HTMLElement
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                // Allow Escape to blur the input
                if (e.key === 'Escape') {
                    target.blur()
                }
                return
            }

            // Ctrl+K or Cmd+K: Quick search/command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                // TODO: Open command palette/search when implemented
            }

            // Ctrl+/ or Cmd+/: Show keyboard shortcuts help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault()
                // TODO: Show keyboard shortcuts modal
            }

            // G then D: Go to Dashboard
            if (e.key === 'g') {
                const nextKey = (ev: KeyboardEvent) => {
                    if (ev.key === 'd') {
                        navigate('/dashboard')
                    }
                    window.removeEventListener('keydown', nextKey)
                }
                window.addEventListener('keydown', nextKey)
                setTimeout(() => window.removeEventListener('keydown', nextKey), 1000)
            }

            // G then P: Go to Projects
            if (e.key === 'g') {
                const nextKey = (ev: KeyboardEvent) => {
                    if (ev.key === 'p') {
                        navigate('/dashboard') // Projects are in dashboard
                    }
                    window.removeEventListener('keydown', nextKey)
                }
                window.addEventListener('keydown', nextKey)
                setTimeout(() => window.removeEventListener('keydown', nextKey), 1000)
            }

            // ? : Show help
            if (e.key === '?') {
                e.preventDefault()
                // TODO: Show help modal
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [navigate])
}
