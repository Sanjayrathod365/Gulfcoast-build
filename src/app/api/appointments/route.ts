import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const patientId = searchParams.get('patientId')
    const userId = searchParams.get('userId')

    // Build where clause
    const where: any = {
      AND: [
        startDate ? { date: { gte: new Date(startDate) } } : {},
        endDate ? { date: { lte: new Date(endDate) } } : {},
        patientId ? { patientId } : {},
        userId ? { userId } : {},
      ],
    }

    // Get paginated and sorted results
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        user: true,
      },
      orderBy: {
        date: 'asc',
      },
      skip: 0,
      take: 10,
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { message: 'Error fetching appointments' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, patientId, date, time, type, status, notes } = body

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        patientId,
        date: new Date(date),
        time,
        type,
        status,
        notes,
      },
      include: {
        patient: true,
        user: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { message: 'Error creating appointment' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { date, time, type, status, notes } = body

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: new Date(date),
        time,
        type,
        status,
        notes,
      },
      include: {
        patient: true,
        user: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { message: 'Error updating appointment' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    await prisma.appointment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { message: 'Error deleting appointment' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 