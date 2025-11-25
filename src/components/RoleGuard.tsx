import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types'
import { Spinner } from './ui/Spinner'

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole | UserRole[]
  fallback?: ReactNode
  redirectTo?: string
}

/**
 * RoleGuard Component
 * 
 * Protects routes/components based on user role.
 * 
 * @param children - Content to render if user has permission
 * @param requiredRole - Single role or array of roles that can access
 * @param fallback - Optional custom component to show if access denied
 * @param redirectTo - Optional redirect path (defaults to /dashboard)
 * 
 * Role hierarchy: admin > user
 * - Admin can access everything
 * - User can only access user level
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  fallback,
  redirectTo = '/dashboard',
}) => {
  const { user, loading, hasPermission } = useAuthStore()

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has required permission
  if (!hasPermission(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

/**
 * ShowIfHasRole Component
 * 
 * Conditionally renders children based on role.
 * Does not redirect, just hides/shows content.
 */
interface ShowIfHasRoleProps {
  children: ReactNode
  requiredRole: UserRole | UserRole[]
  fallback?: ReactNode
}

export const ShowIfHasRole: React.FC<ShowIfHasRoleProps> = ({
  children,
  requiredRole,
  fallback = null,
}) => {
  const { hasPermission } = useAuthStore()

  if (!hasPermission(requiredRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

