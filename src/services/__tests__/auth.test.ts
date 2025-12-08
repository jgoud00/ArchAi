import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, signup, logout, getCurrentUser, uploadAvatar, requestPasswordReset, resetPassword, updateProfile } from '../auth'
import { supabase } from '../supabase'
import { USER_ROLES } from '../../constants'

vi.mock('../supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
            getUser: vi.fn(),
            resetPasswordForEmail: vi.fn(),
            updateUser: vi.fn(),
            getSession: vi.fn()
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn()
        })),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(),
                getPublicUrl: vi.fn()
            }))
        }
    },
    isSupabaseConfigured: vi.fn(() => true)
}))

describe('auth service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('login', () => {
        it('should successfully log in a user', async () => {
            const mockAuthData = {
                user: { id: '123', email: 'test@example.com' }
            }
            const mockUserProfile = {
                id: '123',
                email: 'test@example.com',
                display_name: 'Test User',
                role: USER_ROLES.USER,
                created_at: new Date().toISOString()
            }

            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: mockAuthData,
                error: null
            } as any)

            const mockFrom = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockUserProfile, error: null })
            })
            vi.mocked(supabase.from).mockImplementation(mockFrom as any)

            const user = await login('test@example.com', 'password123')

            expect(user).toHaveProperty('uid', '123')
            expect(user).toHaveProperty('email', 'test@example.com')
            expect(user).toHaveProperty('role', USER_ROLES.USER)
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            })
        })

        it('should throw error on invalid credentials', async () => {
            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: { user: null },
                error: { message: 'Invalid credentials' }
            } as any)

            await expect(login('test@example.com', 'wrong')).rejects.toThrow()
        })

        it('should handle missing user profile gracefully', async () => {
            const mockAuthData = {
                user: { id: '123', email: 'test@example.com', user_metadata: { display_name: 'Test' } }
            }

            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: mockAuthData,
                error: null
            } as any)

            const mockFrom = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                insert: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
            })
            vi.mocked(supabase.from).mockImplementation(mockFrom as any)

            const user = await login('test@example.com', 'password123')

            // Should return user from auth data even if profile missing
            expect(user).toHaveProperty('uid', '123')
            expect(user).toHaveProperty('email', 'test@example.com')
        })
    })

    describe('signup', () => {
        it('should successfully create a new user', async () => {
            const mockAuthData = {
                user: { id: '456', email: 'new@example.com' }
            }
            const mockUserProfile = {
                id: '456',
                email: 'new@example.com',
                display_name: 'New User',
                role: USER_ROLES.USER,
                created_at: new Date().toISOString()
            }

            vi.mocked(supabase.auth.signUp).mockResolvedValue({
                data: mockAuthData,
                error: null
            } as any)

            const mockFrom = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                upsert: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockUserProfile, error: null })
            })
            vi.mocked(supabase.from).mockImplementation(mockFrom as any)

            const user = await signup('new@example.com', 'password123', 'New User')

            expect(user).toHaveProperty('uid', '456')
            expect(user).toHaveProperty('email', 'new@example.com')
            expect(user).toHaveProperty('displayName', 'New User')
            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: 'new@example.com',
                password: 'password123',
                options: {
                    data: {
                        display_name: 'New User'
                    }
                }
            })
        })

        it('should throw error on duplicate email', async () => {
            vi.mocked(supabase.auth.signUp).mockResolvedValue({
                data: { user: null },
                error: { message: 'Email already exists' }
            } as any)

            await expect(signup('existing@example.com', 'pass', 'User')).rejects.toThrow('Email already exists')
        })
    })

    describe('logout', () => {
        it('should successfully log out', async () => {
            vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any)

            await expect(logout()).resolves.not.toThrow()
            expect(supabase.auth.signOut).toHaveBeenCalled()
        })

        it('should throw error on logout failure', async () => {
            vi.mocked(supabase.auth.signOut).mockResolvedValue({
                error: { message: 'Logout failed' }
            } as any)

            await expect(logout()).rejects.toThrow('Logout failed')
        })
    })

    describe('getCurrentUser', () => {
        it('should return user profile', async () => {
            const mockUserProfile = {
                id: '123',
                email: 'test@example.com',
                display_name: 'Test User',
                role: USER_ROLES.USER,
                created_at: new Date().toISOString()
            }

            vi.mocked(supabase.auth.getUser).mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            } as any)

            const mockFrom = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: mockUserProfile, error: null })
            })
            vi.mocked(supabase.from).mockImplementation(mockFrom as any)

            const user = await getCurrentUser('123')

            expect(user).toHaveProperty('uid', '123')
            expect(user).toHaveProperty('email', 'test@example.com')
        })

        it('should return null for non-existent user', async () => {
            vi.mocked(supabase.auth.getUser).mockResolvedValue({
                data: { user: null },
                error: { message: 'Not found' }
            } as any)

            const user = await getCurrentUser('999')

            expect(user).toBeNull()
        })
    })

    describe('uploadAvatar', () => {
        it('should reject files exceeding size limit', async () => {
            const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

            vi.mocked(supabase.auth.getUser).mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            } as any)

            await expect(uploadAvatar(largeFile)).rejects.toThrow('less than 5MB')
        })

        it('should reject non-image files', async () => {
            const textFile = new File(['hello'], 'file.txt', { type: 'text/plain' })

            vi.mocked(supabase.auth.getUser).mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            } as any)

            await expect(uploadAvatar(textFile)).rejects.toThrow('must be an image')
        })

        it('should successfully upload valid avatar', async () => {
            const validImage = new File(['fake-image-data'], 'avatar.jpg', { type: 'image/jpeg' })

            vi.mocked(supabase.auth.getUser).mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            } as any)

            const mockStorage = {
                upload: vi.fn().mockResolvedValue({ error: null, data: {} }),
                getPublicUrl: vi.fn().mockReturnValue({
                    data: { publicUrl: 'https://example.com/avatar.jpg' }
                })
            }

            vi.mocked(supabase.storage.from).mockReturnValue(mockStorage as any)

            const url = await uploadAvatar(validImage)

            expect(url).toBe('https://example.com/avatar.jpg')
            expect(mockStorage.upload).toHaveBeenCalled()
        })
    })

    describe('requestPasswordReset', () => {
        it('should send password reset email', async () => {
            vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ error: null } as any)

            await expect(requestPasswordReset('test@example.com')).resolves.not.toThrow()
            expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalled()
        })

        it('should throw error on invalid email', async () => {
            vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
                error: { message: 'Invalid email' }
            } as any)

            await expect(requestPasswordReset('invalid')).rejects.toThrow()
        })
    })

    describe('resetPassword', () => {
        it('should update password successfully', async () => {
            vi.mocked(supabase.auth.updateUser).mockResolvedValue({ error: null } as any)

            await expect(resetPassword('newPassword123')).resolves.not.toThrow()
            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                password: 'newPassword123'
            })
        })

        it('should throw error on weak password', async () => {
            vi.mocked(supabase.auth.updateUser).mockResolvedValue({
                error: { message: 'Password too weak' }
            } as any)

            await expect(resetPassword('123')).rejects.toThrow('Password too weak')
        })
    })

    describe('updateProfile', () => {
        it('should update display name', async () => {
            vi.mocked(supabase.auth.getUser).mockResolvedValue({
                data: { user: { id: '123' } },
                error: null
            } as any)

            // Mock for update call
            const mockUpdate = vi.fn().mockReturnValue({
                update: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ error: null })
            })

            // Mock for getCurrentUser call  
            const mockFrom = vi.fn((table) => {
                if (table === 'users') {
                    return {
                        update: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: '123',
                                email: 'test@example.com',
                                display_name: 'Updated Name',
                                role: USER_ROLES.USER,
                                created_at: new Date().toISOString()
                            },
                            error: null
                        })
                    }
                }
                return mockUpdate(table)
            })
            vi.mocked(supabase.from).mockImplementation(mockFrom as any)
            vi.mocked(supabase.auth.updateUser).mockResolvedValue({ error: null } as any)

            const user = await updateProfile({ displayName: 'Updated Name' })

            expect(user).toHaveProperty('displayName', 'Updated Name')
        })
    })
})
