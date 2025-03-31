'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          type: 'error',
        })
        return false
      }

      router.push('/dashboard')
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        type: 'error',
      })
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/login')
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during logout',
        type: 'error',
      })
      return false
    }
  }

  const register = async (data: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'An error occurred during registration',
          type: 'error',
        })
        return false
      }

      toast({
        title: 'Success',
        description: 'Registration successful. Please login.',
        type: 'success',
      })
      router.push('/login')
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during registration',
        type: 'error',
      })
      return false
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'An error occurred while resetting password',
          type: 'error',
        })
        return false
      }

      toast({
        title: 'Success',
        description: 'Password reset instructions sent to your email',
        type: 'success',
      })
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while resetting password',
        type: 'error',
      })
      return false
    }
  }

  const updatePassword = async (token: string, password: string) => {
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: result.error || 'An error occurred while updating password',
          type: 'error',
        })
        return false
      }

      toast({
        title: 'Success',
        description: 'Password updated successfully',
        type: 'success',
      })
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while updating password',
        type: 'error',
      })
      return false
    }
  }

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
  }
} 