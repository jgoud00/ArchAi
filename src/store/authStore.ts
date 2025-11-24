import { create } from 'zustand'
import { User, UserRole } from '../types'
import * as authService from '../services/auth'
import { onAuthChange } from '../services/auth'
import { supabase } from '../services/supabase'

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
  isSupervisor: () => boolean
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
    try {
      await authService.logout()
      set({ user: null, userRole: null })
    } catch (error) {
      throw error
    }
  },

  setUser: (user: User | null) => {
    set({ user, userRole: user?.role || null })
  },

  isAdmin: () => {
    return get().user?.role === 'admin'
  },

  isSupervisor: () => {
    return get().user?.role === 'supervisor' || get().user?.role === 'admin'
  },

  isUser: () => {
    return get().user?.role === 'user'
  },

  /**
   * Check if user has required permission
   * @param requiredRole - Single role or array of roles that are allowed
   * @returns true if user has one of the required roles
   * 
   * Role hierarchy: admin > supervisor > user
   * - If requiredRole is 'user', all roles can access
   * - If requiredRole is 'supervisor', admin and supervisor can access
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
    if (userRole === 'admin') return true

    // Supervisor can access user-level permissions
    if (userRole === 'supervisor' && roles.includes('user')) return true

    return false
  },

  /**
   * Initialize authentication state
   * 
   * Flow:
   * 1. Set loading to false immediately to unblock UI
   * 2. Check for existing session synchronously
   * 3. Set up listener for future auth changes (only once)
   */
  initializeAuth: async () => {
    console.log('[Auth Store] Initializing authentication...')
    
    // Step 1: Unblock UI immediately
    set({ loading: false, user: null, userRole: null })
    
    // Step 2: Check for existing session
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[Auth Store] Error getting session:', error)
        // Set up listener even if session check fails
        if (!authUnsubscribe) {
          authUnsubscribe = onAuthChange((user) => {
            console.log('[Auth Store] Auth state changed:', user?.email || 'logged out', 'Role:', user?.role)
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
            console.log('[Auth Store] Found existing session:', user.email, 'Role:', user.role)
            set({ user, userRole: user.role, loading: false })
          }
        } catch (error) {
          console.error('[Auth Store] Error loading user profile:', error)
        }
      }
    } catch (error) {
      console.error('[Auth Store] Error checking session:', error)
    }

    // Step 3: Set up listener for future auth state changes (only once)
    if (!authUnsubscribe) {
      authUnsubscribe = onAuthChange((user) => {
        console.log('[Auth Store] Auth state changed:', user?.email || 'logged out', 'Role:', user?.role)
        set({ user, userRole: user?.role || null, loading: false })
      })
    }
  },
}))
