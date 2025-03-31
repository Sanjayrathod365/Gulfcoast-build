import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('Fetching settings...')
    const session = await getServerSession(authOptions)
    console.log('Session:', session)

    if (!session?.user?.email) {
      console.log('No session or email found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user settings
    console.log('Fetching user with email:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        phone: true,
        settings: {
          select: {
            notifications: true,
            theme: true
          }
        }
      }
    })
    console.log('User found:', user)

    if (!user) {
      console.log('User not found')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user settings with defaults if not set
    const response = {
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      notifications: user.settings?.notifications ?? true,
      theme: user.settings?.theme || 'light'
    }
    console.log('Returning settings:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching settings:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    console.log('Updating settings...')
    const session = await getServerSession(authOptions)
    console.log('Session:', session)

    if (!session?.user?.email) {
      console.log('No session or email found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Update request body:', body)
    const { name, phone, notifications, theme } = body

    // Update user settings
    console.log('Updating user with email:', session.user.email)
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        phone,
        settings: {
          upsert: {
            create: { notifications, theme },
            update: { notifications, theme }
          }
        }
      },
      select: {
        name: true,
        email: true,
        phone: true,
        settings: {
          select: {
            notifications: true,
            theme: true
          }
        }
      }
    })
    console.log('User updated:', user)

    const response = {
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      notifications: user.settings?.notifications ?? true,
      theme: user.settings?.theme || 'light'
    }
    console.log('Returning updated settings:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating settings:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
} 