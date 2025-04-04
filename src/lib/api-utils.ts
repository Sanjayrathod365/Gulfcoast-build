import { NextResponse, NextRequest } from 'next/server'
import { apiResponseSchema } from './validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export function createApiResponse<T>(
  data: T | undefined = undefined,
  error: string | undefined = undefined
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: !error,
    data,
    error,
  }

  // Validate the response
  apiResponseSchema.parse(response)
  return response
}

export function sendApiResponse<T>(
  data: T | undefined = undefined,
  error: string | undefined = undefined,
  status: number = 200
): NextResponse {
  const response = createApiResponse(data, error)
  return NextResponse.json(response, { status })
}

export function handleApiError(error: unknown): NextResponse {
  logger.error('API Error:', error as Error)
  return sendApiResponse(
    undefined,
    error instanceof Error ? error.message : 'An unexpected error occurred',
    500
  )
}

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; error?: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Invalid request data' }
  }
}

export function requireAuth(request: Request): NextResponse | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return sendApiResponse(undefined, 'Unauthorized', 401)
  }
  return null
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.role) {
    return sendApiResponse(
      undefined,
      'You must be logged in to perform this action',
      401
    )
  }

  if (!allowedRoles.includes(session.user.role)) {
    return sendApiResponse(
      undefined,
      'You do not have permission to perform this action',
      403
    )
  }
  
  return null
}

export function handleApiResponse(response: Response) {
  if (!response.ok) {
    const error = new Error('API request failed')
    error.name = 'ApiError'
    throw error
  }
  return response.json()
} 