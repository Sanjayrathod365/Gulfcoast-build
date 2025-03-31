'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/components/auth/LoginForm'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true)
    try {
      const result = await login(data.email, data.password)
      if (result) {
        router.push('/dashboard')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    // In a real application, you would show a modal or navigate to a reset password page
    // For now, we'll just show a toast notification
    const email = prompt('Enter your email address:')
    if (email) {
      await resetPassword(email)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm
            onSubmit={handleSubmit}
            onForgotPassword={handleForgotPassword}
          />
        </CardContent>
      </Card>
    </div>
  )
} 