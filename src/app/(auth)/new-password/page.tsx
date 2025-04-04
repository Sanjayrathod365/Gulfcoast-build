'use client'

import { useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { NewPasswordForm } from '@/components/auth/NewPasswordForm'
import { useRouter, useSearchParams } from 'next/navigation'

function NewPasswordContent() {
  const [isLoading, setIsLoading] = useState(false)
  const { updatePassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (data: { password: string }) => {
    if (!token) {
      // Handle missing token error
      return
    }

    setIsLoading(true)
    try {
      const result = await updatePassword(token, data.password)
      if (result) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">This password reset link is invalid or has expired.</p>
            <button
              onClick={() => router.push('/reset-password')}
              className="text-blue-600 hover:underline"
            >
              Request a new reset link
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <NewPasswordForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/login')}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <NewPasswordContent />
    </Suspense>
  )
} 