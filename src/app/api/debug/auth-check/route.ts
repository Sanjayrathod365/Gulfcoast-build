import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Get credentials from request
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const debugInfo: any = {
      time: new Date().toISOString(),
      checks: {},
      user: null
    };

    // 1. Check if DATABASE_URL exists
    debugInfo.checks.databaseUrlExists = !!process.env.DATABASE_URL;
    debugInfo.databaseUrlPrefix = process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 15) + '...' : 'not set';

    // 2. Test database connection
    try {
      await prisma.$connect();
      debugInfo.checks.databaseConnection = true;
    } catch (dbError: any) {
      debugInfo.checks.databaseConnection = false;
      debugInfo.databaseError = {
        message: dbError.message,
        name: dbError.name,
      };
      return NextResponse.json(debugInfo);
    }

    // 3. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    debugInfo.checks.userExists = !!user;
    
    if (!user) {
      // List all users to help debug
      const allUsers = await prisma.user.findMany({
        select: { email: true, id: true, name: true }
      });
      debugInfo.allUsers = allUsers;
      return NextResponse.json(debugInfo);
    }

    // 4. Check password
    debugInfo.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0
    };

    try {
      const isPasswordValid = await compare(password, user.password || '');
      debugInfo.checks.passwordValid = isPasswordValid;
    } catch (passwordError: any) {
      debugInfo.checks.passwordValid = false;
      debugInfo.passwordError = {
        message: passwordError.message,
        name: passwordError.name
      };
    }

    return NextResponse.json(debugInfo);
  } catch (error: any) {
    console.error('Auth check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        name: error.name,
        time: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 