import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'

export const useAuth = () => {
  const { user, loading, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return { user, loading }
}
