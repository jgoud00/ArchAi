import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export const useAuth = () => {
  const { user, loading, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return { user, loading }
}
