import DOMPurify from 'dompurify'

/**
 * Sanitization Utilities
 * 
 * Provides secure HTML and text sanitization to prevent XSS attacks
 * Uses DOMPurify for comprehensive security
 */

/**
 * Sanitizes HTML content for safe rendering
 * 
 * @param dirty - Untrusted HTML string
 * @param options - DOMPurify configuration options
 * @returns  Sanitized HTML string safe for rendering
 */
export const sanitizeHTML = (
    dirty: string,
    options?: {
        allowedTags?: string[]
        allowedAttributes?: string[]
    }
): string => {
    const defaultConfig = {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br',
            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'code', 'pre', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id']
    }

    const config = options ? {
        ALLOWED_TAGS: options.allowedTags || defaultConfig.ALLOWED_TAGS,
        ALLOWED_ATTR: options.allowedAttributes || defaultConfig.ALLOWED_ATTR
    } : defaultConfig

    return DOMPurify.sanitize(dirty, config)
}

/**
 * Sanitizes user input by stripping all HTML tags
 * 
 * @param text - User input text
 * @returns Plain text with no HTML tags
 */
export const sanitizeText = (text: string): string => {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

/**
 * Sanitizes markdown content for safe rendering
 * 
 * @param markdown - Markdown string
 * @returns Sanitized markdown safe for rendering
 */
export const sanitizeMarkdown = (markdown: string): string => {
    return DOMPurify.sanitize(markdown, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'a', 'p', 'br',
            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'code', 'pre', 'hr', 'table', 'thead',
            'tbody', 'tr', 'th', 'td', 'img'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class']
    })
}

/**
 * Sanitizes URL to prevent javascript: protocol and other XSS vectors
 * 
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeURL = (url: string): string => {
    // Remove any javascript: or data: protocols
    const dangerous = /^(javascript|data|vbscript):/i
    if (dangerous.test(url)) {
        return ''
    }

    // Allow only http, https, and relative URLs
    const allowed = /^(https?:)?\/\//i
    if (!url.startsWith('/') && !url.startsWith('#') && !allowed.test(url)) {
        return ''
    }

    return DOMPurify.sanitize(url, { ALLOWED_TAGS: [] })
}

/**
 * Sanitizes form input data
 * 
 * @param data - Object containing form data
 * @returns Sanitized object with all string values cleaned
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized = {} as Record<string, any>

    Object.keys(data).forEach((key) => {
        const value = data[key]
        if (typeof value === 'string') {
            sanitized[key] = sanitizeText(value)
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeFormData(value)
        } else {
            sanitized[key] = value
        }
    })

    return sanitized as T
}

/**
 * Escape HTML special characters
 * 
 * @param text - Text to escape
 * @returns Escaped text safe for HTML attributes
 */
export const escapeHTML = (text: string): string => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

/**
 * Validates and sanitizes file names
 * 
 * @param fileName - Original file name
 * @returns Sanitized file name safe for storage
 */
export const sanitizeFileName = (fileName: string): string => {
    // Remove path traversal attempts
    let safe = fileName.replace(/\.\./g, '')

    // Remove special characters except dots, dashes, and underscores
    safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_')

    // Limit length
    if (safe.length > 255) {
        const ext = safe.split('.').pop() || ''
        safe = safe.substring(0, 255 - ext.length - 1) + '.' + ext
    }

    return safe
}
