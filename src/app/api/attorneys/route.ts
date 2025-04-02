import { NextResponse } from 'next/server'
import { Prisma, Attorney, User, CaseManager } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { hasPermission } from '@/utils/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { jwtVerify } from 'jose'
import { JwtPayload } from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface CaseManagerData {
  name: string
  email: string
  phone: string
  phoneExt?: string
  faxNumber?: string
}

type AttorneyUpdateData = {
  phone?: string | null
  faxNumber?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipcode?: string | null
  notes?: string | null
}

// GET /api/attorneys - Get all attorneys or a single attorney by ID
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Get single attorney by ID
      const attorney = await prisma.attorney.findUnique({
        where: { id },
        include: {
          caseManagers: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!attorney) {
        return NextResponse.json(
          { message: 'Attorney not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(attorney)
    }

    // Get all attorneys
    const attorneys = await prisma.attorney.findMany({
      include: {
        caseManagers: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(attorneys)
  } catch (error) {
    console.error('Error fetching attorneys:', error)
    return NextResponse.json(
      { message: 'Failed to fetch attorneys' },
      { status: 500 }
    )
  }
}

// POST /api/attorneys - Create a new attorney
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received attorney creation request:', body)
    const { name, email, password, hasLogin, phone, faxNumber, address, city, state, zipcode, zip, notes, caseManagers } = body

    // Validate required fields
    if (!name || !email) {
      console.log('Validation failed: Missing name or email')
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Validate password if hasLogin is true
    if (hasLogin && !password) {
      console.log('Validation failed: Password required for login access')
      return NextResponse.json(
        { message: 'Password is required when login access is enabled' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Email already exists:', email)
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Create attorney and user in a transaction
    const attorney = await prisma.$transaction(async (tx) => {
      console.log('Creating user with data:', {
        email,
        name,
        role: 'ATTORNEY',
        hasLogin
      })

      // Create user first
      const userData: Prisma.UserUncheckedCreateInput = {
        email,
        name,
        role: 'ATTORNEY',
        password: hasLogin && password ? await bcrypt.hash(password, 10) : ''
      }

      const user = await tx.user.create({
        data: userData
      })

      console.log('User created:', user.id)

      console.log('Creating attorney profile with data:', {
        userId: user.id,
        phone,
        address,
        city,
        state,
        zipcode,
        notes
      })

      // Create attorney profile
      const attorneyData: Prisma.AttorneyUncheckedCreateInput = {
        userId: user.id,
        phone,
        address,
        city,
        state,
        zip: zipcode || zip,
        barNumber: null,
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
        email
      }

      console.log('Creating attorney with data:', JSON.stringify(attorneyData, null, 2))

      const attorneyProfile = await tx.attorney.create({
        data: attorneyData,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          caseManagers: true
        },
      })

      console.log('Attorney profile created:', JSON.stringify(attorneyProfile, null, 2))

      // Create case managers if any
      if (caseManagers && caseManagers.length > 0) {
        const validCaseManagers = caseManagers.filter((manager: CaseManagerData) => 
          manager.name && manager.email && manager.phone
        )

        if (validCaseManagers.length > 0) {
          console.log('Creating case managers:', JSON.stringify(validCaseManagers, null, 2))
          await tx.caseManager.createMany({
            data: validCaseManagers.map((manager: CaseManagerData) => ({
              attorneyId: attorneyProfile.id,
              firstName: manager.name.split(' ')[0] || '',
              lastName: manager.name.split(' ').slice(1).join(' ') || '',
              email: manager.email,
              phone: manager.phone
            }))
          })
        }
      }

      return attorneyProfile
    })

    console.log('Attorney created successfully:', JSON.stringify(attorney, null, 2))
    return NextResponse.json(attorney)
  } catch (error) {
    console.error('Error creating attorney:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code)
      console.error('Prisma error message:', error.message)
      if (error.code === 'P2002') {
        return NextResponse.json(
          { message: 'A unique constraint violation occurred. The email may already be registered.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { message: `Database error: ${error.message}` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error creating attorney' },
      { status: 500 }
    )
  }
}

// PUT /api/attorneys/:id - Update an attorney
export async function PUT(request: Request) {
  try {
    // Extract ID from URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    
    if (!id) {
      return NextResponse.json({ message: 'Attorney ID is required' }, { status: 400 })
    }

    const data = await request.json()
    console.log('Received update request:', data)

    const { password, caseManagers, ...attorneyData } = data

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update attorney profile
      const attorney = await tx.attorney.update({
        where: { id },
        data: {
          ...attorneyData,
          firstName: attorneyData.name?.split(' ')[0] || '',
          lastName: attorneyData.name?.split(' ').slice(1).join(' ') || '',
        },
      })

      // If password is provided, update user password
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await tx.user.update({
          where: { id: attorney.userId },
          data: { password: hashedPassword },
        })
      }

      // Handle case managers if provided
      if (caseManagers && caseManagers.length > 0) {
        // Delete existing case managers
        await tx.caseManager.deleteMany({
          where: { attorneyId: id }
        })

        // Create new case managers
        const validCaseManagers = caseManagers.filter((manager: CaseManagerData) => 
          manager.name && manager.email && manager.phone
        )

        if (validCaseManagers.length > 0) {
          await tx.caseManager.createMany({
            data: validCaseManagers.map((manager: CaseManagerData) => ({
              attorneyId: id,
              firstName: manager.name.split(' ')[0] || '',
              lastName: manager.name.split(' ').slice(1).join(' ') || '',
              email: manager.email,
              phone: manager.phone
            }))
          })
        }
      }

      return attorney
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating attorney:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: `Database error: ${error.message}` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update attorney' },
      { status: 500 }
    )
  }
}

// DELETE /api/attorneys/:id - Delete an attorney
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Attorney ID is required' },
        { status: 400 }
      )
    }

    // Get the current user's session from the token
    const cookieHeader = request.headers.get('cookie')
    const token = cookieHeader?.split('; ').find(row => row.startsWith('token='))?.split('=')[1]

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    const userRole = (payload.role as string || '').toUpperCase()

    // Get the attorney to check permissions
    const attorney = await prisma.attorney.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!attorney) {
      return NextResponse.json(
        { message: 'Attorney not found' },
        { status: 404 }
      )
    }

    // Check if user is admin or the attorney themselves
    const isAdmin = userRole === 'ADMIN'
    const isOwnProfile = attorney.userId === payload.userId

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete attorney and associated user in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete case managers first
      await tx.caseManager.deleteMany({
        where: { attorneyId: id }
      })

      // Delete attorney
      await tx.attorney.delete({
        where: { id }
      })

      // Delete user
      await tx.user.delete({
        where: { id: attorney.userId }
      })
    })

    return NextResponse.json({ message: 'Attorney deleted successfully' })
  } catch (error) {
    console.error('Error deleting attorney:', error)
    return NextResponse.json(
      { message: 'Failed to delete attorney' },
      { status: 500 }
    )
  }
} 