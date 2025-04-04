'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/components/auth/LoginForm'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

// Create a client component that uses useSearchParams
function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorMessage = searchParams?.get('error')
  const { toast } = useToast()
  
  useEffect(() => {
    if (errorMessage) {
      toast({
        title: 'Authentication Error',
        description: errorMessage === 'CredentialsSignin' 
          ? 'Invalid email or password' 
          : `Error: ${errorMessage}`,
        variant: 'destructive',
      })
    }
  }, [errorMessage, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const success = await login(values.email, values.password)
      if (!success) {
        // Login failed, but it's already handled in the useAuth hook
        console.log('Login failed')
      }
    } catch (error) {
      console.error('Login submission error:', error)
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      })
    }
  }

  const handleForgotPassword = async () => {
    const email = prompt('Please enter your email address')
    if (email) {
      await resetPassword(email)
      toast({
        title: 'Password Reset',
        description: 'If your email is registered, you will receive a password reset link shortly',
      })
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
          {errorMessage && (
            <div className="mt-2 text-sm text-red-500 text-center">
              {errorMessage}
            </div>
          )}
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

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 