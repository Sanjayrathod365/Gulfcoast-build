import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the request is for the API
  if (path.startsWith('/api/')) {
    // Skip rate limiting if Redis is not configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('Redis is not configured - skipping rate limiting')
      return NextResponse.next()
    }

    try {
      const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
      const { success } = await ratelimit.limit(ip)

      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': '10',
            'Content-Type': 'text/plain',
          },
        })
      }

      return NextResponse.next()
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue without rate limiting on error
      return NextResponse.next()
    }
  }

  // Protected routes
  const protectedPaths = ['/dashboard', '/settings', '/profile']
  const isProtectedPath = protectedPaths.some((pp) => path.startsWith(pp))

  if (isProtectedPath) {
    const token = await getToken({ req: request })

    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(url)
    }
  }

  // Skip middleware for auth routes and API routes
  if (path.startsWith('/api/auth') || path.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Handle authentication
  const token = await getToken({ req: request })
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/reset-password')
  const isApiRoute = path.startsWith('/api/')

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (!token && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add security headers
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 