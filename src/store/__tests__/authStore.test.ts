import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'
import * as authService from '../../services/auth'
import { User, UserRole } from '../../types'
import { USER_ROLES } from '../../constants'

// Mock the auth service
vi.mock('../../services/auth')
vi.mock('../../services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn()
        }
    },
    isSupabaseConfigured: vi.fn(() => true)
}))

describe('authStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useAuthStore.setState({
            user: null,
            loading: false,
            userRole: null
        })
        vi.clearAllMocks()
    })

    describe('login', () => {
        it('should successfully log in a user', async () => {
            const mockUser: User = {
                uid: '123',
                email: 'test@example.com',
                displayName: 'Test User',
                role: USER_ROLES.USER as UserRole,
                createdAt: new Date()
            }

            vi.mocked(authService.login).mockResolvedValue(mockUser)

            const { login } = useAuthStore.getState()
            await login('test@example.com', 'password123')

            const state = useAuthStore.getState()
            expect(state.user).toEqual(mockUser)
            expect(state.userRole).toBe(USER_ROLES.USER)
            expect(state.loading).toBe(false)
        })

        it('should handle login errors', async () => {
            vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

            const { login } = useAuthStore.getState()

            await expect(login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials')

            const state = useAuthStore.getState()
            expect(state.user).toBeNull()
            expect(state.loading).toBe(false)
        })
    })

    describe('signup', () => {
        it('should successfully sign up a new user', async () => {
            const mockUser: User = {
                uid: '456',
                email: 'new@example.com',
                displayName: 'New User',
                role: USER_ROLES.USER as UserRole,
                createdAt: new Date()
            }

            vi.mocked(authService.signup).mockResolvedValue(mockUser)

            const { signup } = useAuthStore.getState()
            await signup('new@example.com', 'password123', 'New User')

            const state = useAuthStore.getState()
            expect(state.user).toEqual(mockUser)
            expect(state.userRole).toBe(USER_ROLES.USER)
            expect(state.loading).toBe(false)
        })

        it('should handle signup errors', async () => {
            vi.mocked(authService.signup).mockRejectedValue(new Error('Email already exists'))

            const { signup } = useAuthStore.getState()

            await expect(signup('existing@example.com', 'pass', 'User')).rejects.toThrow('Email already exists')
        })
    })

    describe('logout', () => {
        it('should clear user state on logout', async () => {
            // Set initial user
            useAuthStore.setState({
                user: {
                    uid: '123',
                    email: 'test@example.com',
                    displayName: 'Test',
                    role: USER_ROLES.USER as UserRole,
                    createdAt: new Date()
                },
                userRole: USER_ROLES.USER as UserRole
            })

            vi.mocked(authService.logout).mockResolvedValue()

            const { logout } = useAuthStore.getState()
            await logout()

            const state = useAuthStore.getState()
            expect(state.user).toBeNull()
            expect(state.userRole).toBeNull()
        })
    })

    describe('isAdmin', () => {
        it('should return true for admin users', () => {
            useAuthStore.setState({
                user: {
                    uid: '123',
                    email: 'admin@example.com',
                    displayName: 'Admin',
                    role: USER_ROLES.ADMIN as UserRole,
                    createdAt: new Date()
                },
                userRole: USER_ROLES.ADMIN as UserRole
            })

            const { isAdmin } = useAuthStore.getState()
            expect(isAdmin()).toBe(true)
        })

        it('should return false for non-admin users', () => {
            useAuthStore.setState({
                user: {
                    uid: '123',
                    email: 'user@example.com',
                    displayName: 'User',
                    role: USER_ROLES.USER as UserRole,
                    createdAt: new Date()
                },
                userRole: USER_ROLES.USER as UserRole
            })

            const { isAdmin } = useAuthStore.getState()
            expect(isAdmin()).toBe(false)
        })
    })

    describe('hasPermission', () => {
        it('should allow admin to access anything', () => {
            useAuthStore.setState({
                user: {
                    uid: '123',
                    email: 'admin@example.com',
                    displayName: 'Admin',
                    role: USER_ROLES.ADMIN as UserRole,
                    createdAt: new Date()
                }
            })

            const { hasPermission } = useAuthStore.getState()
            expect(hasPermission(USER_ROLES.USER as UserRole)).toBe(true)
            expect(hasPermission(USER_ROLES.ADMIN as UserRole)).toBe(true)
        })

        it('should allow user to access user-level content', () => {
            useAuthStore.setState({
                user: {
                    uid: '123',
                    email: 'user@example.com',
                    displayName: 'User',
                    role: USER_ROLES.USER as UserRole,
                    createdAt: new Date()
                }
            })

            const { hasPermission } = useAuthStore.getState()
            expect(hasPermission(USER_ROLES.USER as UserRole)).toBe(true)
        })

        it('should deny user access to admin-only content', () => {
            useAuthStore.setState({
                user: {
                    uid: '123',
                    email: 'user@example.com',
                    displayName: 'User',
                    role: USER_ROLES.USER as UserRole,
                    createdAt: new Date()
                }
            })

            const { hasPermission } = useAuthStore.getState()
            expect(hasPermission(USER_ROLES.ADMIN as UserRole)).toBe(false)
        })

        it('should return false when no user is logged in', () => {
            const { hasPermission } = useAuthStore.getState()
            expect(hasPermission(USER_ROLES.USER as UserRole)).toBe(false)
        })

        it('should handle array of required roles', () => {
            useAuthStore.setState({
                user: {
                    uid: '123',
                    email: 'user@example.com',
                    displayName: 'User',
                    role: USER_ROLES.USER as UserRole,
                    createdAt: new Date()
                }
            })

            const { hasPermission } = useAuthStore.getState()
            expect(hasPermission([USER_ROLES.USER as UserRole, USER_ROLES.ADMIN as UserRole])).toBe(true)
        })
    })
})
