import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'

export const Logout = () => {
    const navigate = useNavigate()
    const { logout } = useAuthStore()

    useEffect(() => {
        const handleLogout = async () => {
            try {
                await logout()
                // Redirect to login page after logout
                navigate('/login', { replace: true })
            } catch (error) {
                console.error('Logout failed:', error)
                // Redirect to login anyway
                navigate('/login', { replace: true })
            }
        }

        handleLogout()
    }, [logout, navigate])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Spinner size="lg" />
            <p className="mt-4 text-muted-foreground">Logging out...</p>
        </div>
    )
}
