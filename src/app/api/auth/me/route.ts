import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 