import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Spinner } from './ui/Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication.
 * Redirects to login if user is not authenticated.
 * 
 * Improved to prevent infinite loading by checking auth state properly.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore()

  // Don't show loading spinner - initializeAuth sets loading to false immediately
  // If user is null and not loading, they're truly not authenticated
  // Give a brief moment for session check to complete
  if (!loading && !user) {
    return <Navigate to="/login" replace />
  }

  // If we have a user, render the protected content
  if (user) {
    return <>{children}</>
  }

  // Brief loading state while checking session (should be very quick)
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" />
      <p className="ml-4 text-muted-foreground">Loading...</p>
    </div>
  )
}