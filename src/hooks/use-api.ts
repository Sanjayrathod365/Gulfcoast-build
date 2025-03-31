import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  status: number
}

interface UseApiOptions<T = any> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

interface ApiCallOptions {
  successMessage?: string
  errorMessage?: string
}

export function useApi<T = any>(options: UseApiOptions<T> = {}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const callApi = async <R = T>(
    url: string,
    method: string = 'GET',
    body?: any,
    callOptions?: ApiCallOptions
  ): Promise<ApiResponse<R> | null> => {
    try {
      setLoading(true)
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'An error occurred')
      }

      const successMessage = callOptions?.successMessage || options.successMessage
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        })
      }

      options.onSuccess?.(result.data)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      const displayMessage = callOptions?.errorMessage || options.errorMessage || errorMessage
      
      toast({
        title: 'Error',
        description: displayMessage,
        variant: 'destructive',
      })

      options.onError?.(error as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    callApi,
  }
} 