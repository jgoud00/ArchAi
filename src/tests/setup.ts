import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock environment variables for tests
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('VITE_APP_URL', 'http://localhost:5173')

// Mock Supabase client globally for components that import it
vi.mock('./services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } }
            }))
        }
    },
    isSupabaseConfigured: vi.fn(() => true)
}))
