/**
 * String Sanitization Utilities Tests
 * 
 * Tests for sanitizeHtml function
 */

import { describe, it, expect } from 'vitest'
import { sanitizeHTML } from '../sanitize'

describe('Sanitization Utilities', () => {
    describe('sanitizeHTML', () => {
        it('should allow safe HTML tags', () => {
            const input = '<p>Hello <strong>world</strong></p>'
            const result = sanitizeHTML(input)

            expect(result).toBeDefined()
            expect(result).toContain('Hello')
            expect(result).toContain('world')
        })

        it('should remove script tags', () => {
            const input = '<p>Safe content</p><script>alert("XSS")</script>'
            const result = sanitizeHTML(input)

            expect(result).not.toContain('<script')
            expect(result).not.toContain('alert')
        })

        it('should remove event handlers', () => {
            const input = '<div onclick="malicious()">Click me</div>'
            const result = sanitizeHTML(input)

            expect(result).not.toContain('onclick')
            expect(result).not.toContain('malicious')
        })

        it('should handle empty string', () => {
            const result = sanitizeHTML('')
            expect(result).toBe('')
        })

        it('should handle plain text', () => {
            const input = 'Just plain text'
            const result = sanitizeHTML(input)
            expect(result).toBe('Just plain text')
        })
    })
})
