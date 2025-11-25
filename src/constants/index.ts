/**
 * Application Constants
 * 
 * Centralized constants for the application to avoid magic numbers
 * and improve maintainability.
 */

// File upload limits
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB for avatars

// Network timeouts
export const FETCH_TIMEOUT_MS = 30000 // 30 seconds
export const UPLOAD_TIMEOUT_MS = 300000 // 5 minutes for large uploads

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Cache durations
export const STORAGE_CACHE_CONTROL = '3600' // 1 hour
export const AVATAR_CACHE_CONTROL = '86400' // 24 hours

// Toast durations
export const TOAST_DURATION_MS = 5000 // 5 seconds

// Retry configuration
export const MAX_RETRY_ATTEMPTS = 3
export const RETRY_DELAY_MS = 1000 // 1 second

// Activity log limits
export const DEFAULT_ACTIVITY_LIMIT = 50
export const MAX_ACTIVITY_LIMIT = 200

// Search and filter limits
export const MAX_SEARCH_RESULTS = 100
export const DEBOUNCE_DELAY_MS = 300 // 300ms debounce for search

