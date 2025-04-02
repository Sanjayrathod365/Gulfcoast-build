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
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(cases)
  } catch (error) {
    console.error('Error fetching cases:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { caseNumber, patientId, status, filingDate, notes } = body

    // Convert the date string to an ISO-8601 DateTime
    const formattedFilingDate = new Date(filingDate).toISOString()

    const case_ = await prisma.case.create({
      data: {
        caseNumber,
        patient: {
          connect: { id: patientId },
        },
        status,
        filingDate: formattedFilingDate,
        notes,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(case_)
  } catch (error) {
    console.error('Error creating case:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 