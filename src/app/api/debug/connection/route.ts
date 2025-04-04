import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL environment variable is not set' },
        { status: 500 }
      );
    }

    // Try to connect to the database
    await prisma.$connect();
    
    // Try to get a count of users to verify full functionality
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      databaseUrl: process.env.DATABASE_URL.substring(0, 15) + '...', // Only show beginning for security
      userCount,
      time: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    
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