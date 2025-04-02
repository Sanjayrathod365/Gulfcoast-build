import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const cases = await prisma.case.findMany({
      include: {
        patient: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(cases)
  } catch (error) {
    console.error('Error fetching cases:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 