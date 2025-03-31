import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

type AppointmentInput = {
  patientId: string
  date: Date
  time: string
  type: string
  status?: string
  notes?: string | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const patientId = searchParams.get('patientId')

    const where: Record<string, any> = {}

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    if (patientId) {
      where.patientId = patientId
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { patientId, date, time, type, status = 'scheduled', notes } = data

    const appointmentData = {
      patientId,
      date: new Date(date),
      time,
      type,
      status,
      notes,
    } satisfies AppointmentInput

    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        patient: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, patientId, date, time, type, status, notes } = data

    const appointmentData = {
      patientId,
      date: date ? new Date(date) : undefined,
      time,
      type,
      status,
      notes,
    } satisfies Partial<AppointmentInput>

    const appointment = await prisma.appointment.update({
      where: { id },
      data: appointmentData,
      include: {
        patient: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json()
    const { id } = data

    await prisma.appointment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
} 