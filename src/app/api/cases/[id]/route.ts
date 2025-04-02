import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const case_ = await prisma.case.findUnique({
      where: {
        id: resolvedParams.id,
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

    if (!case_) {
      return new NextResponse('Case not found', { status: 404 })
    }

    // Format the date to ISO string for consistent handling
    const formattedCase = {
      ...case_,
      filingDate: case_.filingDate?.toISOString() || null,
    }

    return NextResponse.json(formattedCase)
  } catch (error) {
    console.error('Error fetching case:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const { caseNumber, status, filingDate, notes } = body

    const case_ = await prisma.case.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        caseNumber,
        status,
        filingDate: filingDate ? new Date(filingDate) : null,
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

    // Format the date to ISO string for consistent handling
    const formattedCase = {
      ...case_,
      filingDate: case_.filingDate?.toISOString() || null,
    }

    return NextResponse.json(formattedCase)
  } catch (error) {
    console.error('Error updating case:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const resolvedParams = await params
    await prisma.case.delete({
      where: {
        id: resolvedParams.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting case:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 