import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, dateOfBirth, gender, phone, address } = body

    // Validate required fields
    if (!email || !password || !name || !dateOfBirth || !gender || !phone || !address) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and patient in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'patient',
          name,
        },
      })

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

      return { user, patient }
    })

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
    console.error('Error registering patient:', error)
    return NextResponse.json(
      { message: 'Error registering patient' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 