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

    const procedure = await prisma.procedure.create({
      data: {
        patientId: data.patientId,
        isCompleted: data.isCompleted,
        exam: data.exam,
        scheduleDate: new Date(data.scheduleDate),
        scheduleTime: data.scheduleTime,
        statusId: data.statusId,
        facilityId: data.facilityId,
        physicianId: data.physicianId,
        lop: data.lop,
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
    console.error('Error creating procedure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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