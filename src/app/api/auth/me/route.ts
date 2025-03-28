import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie')
    const token = cookieHeader?.split('; ').find(row => row.startsWith('token='))?.split('=')[1]

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { 
        email: payload.email as string 
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        doctor: true,
        attorney: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error getting user data:', error)
    if (error instanceof Error && error.name === 'JWTExpired') {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 