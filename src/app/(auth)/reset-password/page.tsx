'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (data: { email: string }) => {
    setIsLoading(true)
    try {
      const result = await resetPassword(data.email)
      if (result?.success) {
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/login')}
          />
          <div className="mt-4 text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 