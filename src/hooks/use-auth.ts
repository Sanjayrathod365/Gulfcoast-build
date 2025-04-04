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
        callbackUrl: '/dashboard',
      })

      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
        return false
      }

      if (result?.ok) {
        router.push('/dashboard')
      }
      return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      })
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/login')
      toast({
        title: 'Success',
        description: 'You have been logged out',
        variant: 'default',
      })
      return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An error occurred during logout',
        variant: 'destructive',
      })
      return false
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.message || 'An error occurred during registration',
          variant: 'destructive',
        })
        return false
      }

      toast({
        title: 'Success',
        description: 'Registration successful! You can now login.',
        variant: 'default',
      })
      router.push('/login')
      return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An error occurred during registration',
        variant: 'destructive',
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

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.message || 'An error occurred',
          variant: 'destructive',
        })
        return false
      }

      toast({
        title: 'Success',
        description: 'Password reset email sent',
        variant: 'default',
      })
      return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An error occurred during password reset',
        variant: 'destructive',
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

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.message || 'An error occurred',
          variant: 'destructive',
        })
        return false
      }

      toast({
        title: 'Success',
        description: 'Password updated successfully',
        variant: 'default',
      })
      router.push('/login')
      return true
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An error occurred during password update',
        variant: 'destructive',
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