import { create } from 'zustand'
import { User, UserRole } from '@/types'
import * as authService from '../services/auth'
import { onAuthChange } from '../services/auth'
import { supabase } from '@/services/supabase'
import { USER_ROLES } from '@/constants'
import { logger } from '@/utils/logger'

/**
 * Architecture Note:
 * This store manages the global authentication state using Zustand.
 * It integrates with Supabase Auth and provides role-based access control helpers.
 * The initializeAuth function ensures the session is restored on app load.
 */
interface AuthStore {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  initializeAuth: () => Promise<void>
  // Role-based helpers
  userRole: UserRole | null
  isAdmin: () => boolean
  isUser: () => boolean
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean
}

// Store unsubscribe function to prevent multiple subscriptions
let authUnsubscribe: (() => void) | null = null

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  userRole: null,

  login: async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password)
      set({ user, userRole: user.role, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      const user = await authService.signup(email, password, name)
      set({ user, userRole: user.role, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, userRole: null })
  },

  setUser: (user: User | null) => {
    set({ user, userRole: user?.role || null })
  },

  isAdmin: () => {
    return get().user?.role === USER_ROLES.ADMIN
  },

  isUser: () => {
    return get().user?.role === USER_ROLES.USER
  },

  /**
   * Check if user has required permission
   * @param requiredRole - Single role or array of roles that are allowed
   * @returns true if user has one of the required roles
   * 
   * Role hierarchy: admin > user
   * - If requiredRole is 'user', all roles can access
   * - If requiredRole is 'admin', only admin can access
   */
  hasPermission: (requiredRole: UserRole | UserRole[]) => {
    const user = get().user
    if (!user) return false

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const userRole = user.role

    // Check direct match
    if (roles.includes(userRole)) return true

    // Role hierarchy: admin can access everything
    if (userRole === USER_ROLES.ADMIN) return true

    return false
  },

  /**
   * Initialize authentication state
   * 
   * Flow:
   * 1. Check for existing session
   * 2. Set up listener for future auth changes (only once)
   */
  initializeAuth: async () => {
    // Keep UI in loading state until session check concludes
    set({ loading: true })

    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        logger.error('Auth store: failed to get session', error)
        // Set up listener even if session check fails
        if (!authUnsubscribe) {
          authUnsubscribe = onAuthChange((user) => {
            set({ user, userRole: user?.role || null, loading: false })
          })
        }
        return
      }

      // If session exists, load user profile with role
      if (session?.user) {
        try {
          const user = await authService.getCurrentUser(session.user.id)
          if (user) {
            set({ user, userRole: user.role, loading: false })
          }
        } catch (error) {
          logger.error('Auth store: failed to load user profile', error, { userId: session.user.id })
        }
      }
    } catch (error) {
      logger.error('Auth store: session check failed', error)
    } finally {
      set((state) => ({
        ...state,
        loading: false,
      }))
    }

    // Step 3: Set up listener for future auth state changes (only once)
    if (!authUnsubscribe) {
      authUnsubscribe = onAuthChange((user) => {
        set({ user, userRole: user?.role || null, loading: false })
      })
    }
  },
}))
