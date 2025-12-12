/**
 * Keyboard Shortcuts Hook
 * 
 * Provides global keyboard shortcuts for common actions.
 * 
 * Shortcuts:
 * - Ctrl/Cmd+K: Open command palette (handled by CommandPalette component)
 * - Ctrl/Cmd+/: Show keyboard shortcuts (handled by KeyboardShortcutsHelp component)
 * - G then D: Go to Dashboard
 * - G then S: Go to Settings
 * - G then C: Go to Calendar
 * - G then T: Go to Templates
 * - Escape: Blur active input
 */

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export const useKeyboardShortcuts = () => {
    const navigate = useNavigate()
    const pendingKey = useRef<string | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

            // Handle G + key navigation sequences
            if (pendingKey.current === 'g') {
                pendingKey.current = null
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                    timeoutRef.current = null
                }

                switch (e.key.toLowerCase()) {
                    case 'd':
                        e.preventDefault()
                        navigate('/dashboard')
                        break
                    case 's':
                        e.preventDefault()
                        navigate('/settings')
                        break
                    case 'c':
                        e.preventDefault()
                        navigate('/calendar')
                        break
                    case 't':
                        e.preventDefault()
                        navigate('/templates')
                        break
                    case 'o':
                        e.preventDefault()
                        navigate('/documentation')
                        break
                }
                return
            }

            // Start G sequence
            if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                pendingKey.current = 'g'
                // Clear after 1 second if no second key
                timeoutRef.current = setTimeout(() => {
                    pendingKey.current = null
                }, 1000)
                return
            }

            // Home key: Go to dashboard
            if (e.key === 'Home' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault()
                navigate('/dashboard')
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => {
            window.removeEventListener('keydown', handleKeyPress)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [navigate])
}
