import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// This is a debug-only endpoint to create a test user
// Only use in development or testing environments
export async function POST(request: Request) {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_TEST_USER_CREATION) {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists', userId: existingUser.id },
        { status: 200 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'admin', // Default to admin for test user
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      userId: user.id,
      time: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Test user creation failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        name: error.name,
        time: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 