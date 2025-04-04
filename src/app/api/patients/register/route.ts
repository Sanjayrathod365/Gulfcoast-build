import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendApiResponse, handleApiError } from '@/lib/api-utils'
import { logger } from '@/lib/logger'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, dateOfBirth, gender, phone, address } = body

    // Validate required fields
    if (!email || !password || !name || !dateOfBirth || !gender || !phone || !address) {
      return sendApiResponse(undefined, 'All fields are required', 400)
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return sendApiResponse(undefined, 'Email already registered', 400)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    logger.info('Starting patient registration', request)

    // Create user and patient in a transaction
    const result = await prisma.$transaction(async (tx) => {
      try {
        // Create user
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: 'patient',
            name,
          },
        })
        logger.info(`User created: ${user.id}`, request)

        // Create patient profile
        const patient = await tx.patient.create({
          data: {
            userId: user.id,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            phone,
            address,
          },
        })
        logger.info(`Patient profile created: ${patient.id}`, request)

        return { user, patient }
      } catch (error) {
        logger.error('Transaction error', error instanceof Error ? error : new Error('Unknown error'), request)
        throw error
      }
    })

    logger.info('Patient registration completed successfully', request)

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      process.env.JWT_SECRET || 'your-jwt-secret-here',
      { expiresIn: '1d' }
    )

    // Set token in cookie
    const response = NextResponse.json(
      { message: 'Patient registered successfully' },
      { status: 201 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })

    return response
  } catch (error) {
    return handleApiError(error)
  }
} 