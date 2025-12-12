import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useToast } from '@/hooks/useToast'
import { loginSchema, signupSchema } from '@/utils/validators'
import { supabase } from '@/services/supabase'

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

/**
 * Hook to encapsulate authentication logic for Login and Signup pages.
 * Handles form state, validation, and auth actions (login, signup, google auth).
 */
export const useAuthLogic = () => {
    const navigate = useNavigate()
    const { login, signup } = useAuthStore()
    const { showToast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const signupForm = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    })

    const handleLogin = async (data: LoginFormData) => {
        try {
            setIsLoading(true)
            await login(data.email, data.password)
            showToast('Welcome back!', 'success')
            navigate('/dashboard')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to login'
            showToast(message, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignup = async (data: SignupFormData) => {
        try {
            setIsLoading(true)
            await signup(data.email, data.password, data.name)
            showToast('Account created successfully!', 'success')
            navigate('/dashboard')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create account'
            showToast(message, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            })
            if (error) throw error
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to login with Google'
            showToast(message, 'error')
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        loginForm,
        signupForm,
        handleLogin,
        handleSignup,
        handleGoogleLogin,
    }
}
