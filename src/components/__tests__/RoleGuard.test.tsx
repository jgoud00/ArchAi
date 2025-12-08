import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleGuard } from '../RoleGuard'
import { useAuthStore } from '@/store/authStore'
import { USER_ROLES } from '@/constants'

vi.mock('@/store/authStore')

const AdminContent = () => <div>Admin Only Content</div>
const ForbiddenContent = () => <div>Access Denied</div>

describe('RoleGuard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render children when user has required role', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: {
                uid: '123',
                email: 'admin@example.com',
                displayName: 'Admin',
                role: USER_ROLES.ADMIN,
                createdAt: new Date()
            },
            hasPermission: vi.fn(() => true)
        } as any)

        render(
            <RoleGuard requiredRole={USER_ROLES.ADMIN}>
                <AdminContent />
            </RoleGuard>
        )

        expect(screen.getByText('Admin Only Content')).toBeInTheDocument()
    })

    it('should show fallback when user lacks required role', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: {
                uid: '123',
                email: 'user@example.com',
                displayName: 'User',
                role: USER_ROLES.USER,
                createdAt: new Date()
            },
            hasPermission: vi.fn(() => false)
        } as any)

        render(
            <RoleGuard requiredRole={USER_ROLES.ADMIN} fallback={<ForbiddenContent />}>
                <AdminContent />
            </RoleGuard>
        )

        expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
        expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })

    it('should show default message when no fallback provided', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: {
                uid: '123',
                email: 'user@example.com',
                displayName: 'User',
                role: USER_ROLES.USER,
                createdAt: new Date()
            },
            hasPermission: vi.fn(() => false)
        } as any)

        render(
            <RoleGuard requiredRole={USER_ROLES.ADMIN}>
                <AdminContent />
            </RoleGuard>
        )

        expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
    })

    it('should handle array of allowed roles', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: {
                uid: '123',
                email: 'user@example.com',
                displayName: 'User',
                role: USER_ROLES.USER,
                createdAt: new Date()
            },
            hasPermission: vi.fn((roles) => {
                const roleArray = Array.isArray(roles) ? roles : [roles]
                return roleArray.includes(USER_ROLES.USER)
            })
        } as any)

        render(
            <RoleGuard requiredRole={[USER_ROLES.USER, USER_ROLES.ADMIN]}>
                <AdminContent />
            </RoleGuard>
        )

        expect(screen.getByText('Admin Only Content')).toBeInTheDocument()
    })

    it('should deny access when user is null', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: null,
            hasPermission: vi.fn(() => false)
        } as any)

        render(
            <RoleGuard requiredRole={USER_ROLES.USER} fallback={<ForbiddenContent />}>
                <AdminContent />
            </RoleGuard>
        )

        expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument()
        expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })

    it('should allow admin to access user-level content', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: {
                uid: '123',
                email: 'admin@example.com',
                displayName: 'Admin',
                role: USER_ROLES.ADMIN,
                createdAt: new Date()
            },
            hasPermission: vi.fn(() => true)  // Admin has permission for everything
        } as any)

        render(
            <RoleGuard requiredRole={USER_ROLES.USER}>
                <AdminContent />
            </RoleGuard>
        )

        expect(screen.getByText('Admin Only Content')).toBeInTheDocument()
    })
})
