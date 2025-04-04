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

  // Create a simple form rather than using the component
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted:', values);
    setIsLoading(true);
    try {
      const success = await login(values.email, values.password)
      console.log('Login result:', success);
      if (!success) {
        console.log('Login failed')
      }
    } catch (error) {
      console.error('Login submission error:', error)
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
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

  // Use a direct form instead of the LoginForm component
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleForgotPassword}
                  className="text-sm"
                >
                  Forgot password?
                </Button>
              </div>

              <Button type="submit" className="w-full">
                Log in
              </Button>
            </form>
          </Form>
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