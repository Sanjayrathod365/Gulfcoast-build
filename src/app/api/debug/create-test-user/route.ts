import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    // Use simple credentials for testing
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    console.log('Testing database connection...');
    
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbError.message
      }, { status: 500 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        message: 'Test user already exists',
        userId: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        loginCredentials: {
          email,
          password: 'password123' // Plain text for testing only
        }
      });
    }

    // Create a password hash
    console.log('Hashing password...');
    const hashedPassword = await hash(password, 10);
    console.log('Password hashed successfully');

    // Create user
    console.log('Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'admin'
      }
    });
    console.log('User created successfully');

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      userId: user.id,
      email: user.email,
      name: user.name,
      loginCredentials: {
        email,
        password: 'password123' // Plain text for testing only
      }
    });
  } catch (error: any) {
    console.error('Error creating test user:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 