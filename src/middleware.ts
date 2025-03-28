import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Define public paths that don't require authentication
const publicPaths = ['/login', '/register']

// Define role types
type Role = 'ADMIN' | 'STAFF' | 'DOCTOR' | 'ATTORNEY'

// Give all roles full access for now
const allPaths = ['/dashboard', '/patients', '/tools', '/calendar', '/reports', '/settings']

// Define role-based access control (temporarily giving all roles full access)
const roleAccess: Record<Role, string[]> = {
  ADMIN: allPaths,
  STAFF: allPaths,
  DOCTOR: allPaths,
  ATTORNEY: allPaths
}

export async function middleware(request: NextRequest) {
  // Allow public paths
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth/login') ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register'
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    const userRole = (payload.role as string || '').toUpperCase() as Role

    // Allow API routes for authenticated users
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'no-store')
      return response
    }

    // Check role-based access (currently allowing all paths for all roles)
    const allowedPaths = roleAccess[userRole] || allPaths
    const isPathAllowed = allowedPaths.some((path: string) => {
      // Allow access to all subdirectories under allowed paths
      return request.nextUrl.pathname.startsWith(path)
    })

    if (!isPathAllowed) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch (error) {
    console.error('Token verification failed:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 