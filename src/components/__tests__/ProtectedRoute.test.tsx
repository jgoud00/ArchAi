import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import { USER_ROLES } from '@/constants'

vi.mock('@/store/authStore')

const TestComponent = () => <div>Protected Content</div>
const LoginComponent = () => <div>Login Page</div>

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render children when user is authenticated', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: {
                uid: '123',
                email: 'test@example.com',
                displayName: 'Test User',
                role: USER_ROLES.USER,
                createdAt: new Date()
            },
            loading: false
        } as any)

        render(
            <BrowserRouter>
                <Routes>
                    <Route element={<ProtectedRoute><TestComponent /></ProtectedRoute>}>
                        <Route path="/" element={<div>Content</div>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        )

        expect(screen.queryByText('Protected Content')).toBeInTheDocument()
    })

    it('should redirect to login when user is not authenticated', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: null,
            loading: false
        } as any)

        render(
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </BrowserRouter>
        )

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should show loading spinner while checking authentication', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: null,
            loading: true
        } as any)

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            </BrowserRouter>
        )

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should allow admin users', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            user: {
                uid: '123',
                email: 'admin@example.com',
                displayName: 'Admin',
                role: USER_ROLES.ADMIN,
                createdAt: new Date()
            },
            loading: false
        } as any)

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            </BrowserRouter>
        )

        expect(screen.queryByText('Protected Content')).toBeInTheDocument()
    })

    it('should handle session expiration', () => {
        // Start with authenticated user
        const { rerender } = render(
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </BrowserRouter>
        )

        // Initially authenticated
        vi.mocked(useAuthStore).mockReturnValue({
            user: {
                uid: '123',
                email: 'test@example.com',
                displayName: 'Test',
                role: USER_ROLES.USER,
                createdAt: new Date()
            },
            loading: false
        } as any)

        rerender(
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </BrowserRouter>
        )

        // Session expires
        vi.mocked(useAuthStore).mockReturnValue({
            user: null,
            loading: false
        } as any)

        rerender(
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
                    <Route path="/login" element={<LoginComponent />} />
                </Routes>
            </BrowserRouter>
        )

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
})
