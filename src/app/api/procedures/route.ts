import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    const where = patientId ? { patientId } : {}

    const procedures = await prisma.procedure.findMany({
      where,
      include: {
        patient: true,
        facility: true,
        physician: true,
        status: true,
      },
      orderBy: {
        scheduleDate: 'desc',
      },
    })

    return NextResponse.json(procedures)
  } catch (error) {
    console.error('Error fetching procedures:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.patientId || !data.examId || !data.scheduleDate || !data.scheduleTime) {
      return NextResponse.json({
        error: 'Patient, exam, schedule date, and schedule time are required'
      }, { status: 400 })
    }

    // Validate time format (HH:mm:ss)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
    if (!timeRegex.test(data.scheduleTime)) {
      return NextResponse.json({
        error: 'Invalid time format. Please use HH:mm:ss format'
      }, { status: 400 })
    }

    // Create the procedure
    const procedure = await prisma.procedure.create({
      data: {
        patient: {
          connect: { id: data.patientId }
        },
        exam: {
          connect: { id: data.examId }
        },
        status: {
          connect: { id: data.statusId }
        },
        scheduleDate: new Date(data.scheduleDate),
        scheduleTime: data.scheduleTime,
        ...(data.facilityId && {
          facility: {
            connect: { id: data.facilityId }
          }
        }),
        ...(data.physicianId && {
          physician: {
            connect: { id: data.physicianId }
          }
        }),
        isCompleted: false
      },
      include: {
        patient: true,
        exam: true,
        status: true,
        facility: true,
        physician: true
      }
    })

    return NextResponse.json(procedure)
  } catch (error) {
    console.error('[PROCEDURES_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create procedure' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Procedure ID is required' },
        { status: 400 }
      )
    }

    const procedure = await prisma.procedure.update({
      where: { id },
      data: {
        ...updateData,
        scheduleDate: updateData.scheduleDate
          ? new Date(updateData.scheduleDate)
          : undefined,
      },
      include: {
        patient: true,
        facility: true,
        physician: true,
        status: true,
      },
    })

    return NextResponse.json(procedure)
  } catch (error) {
    console.error('Error updating procedure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Procedure ID is required' },
        { status: 400 }
      )
    }

    await prisma.procedure.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Procedure deleted successfully' })
  } catch (error) {
    console.error('Error deleting procedure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 