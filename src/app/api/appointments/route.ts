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

    console.log('Fetching appointments with params:', {
      startDate,
      endDate,
      patientId
    })

    const where: Record<string, any> = {}

    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        
        where.date = {
          gte: start,
          lte: end,
        }
      } else {
        where.date = {
          gte: start,
        }
      }
      
      console.log('Date filter:', where.date)
    }

    if (patientId) {
      where.patientId = patientId
    }

    console.log('Final where clause:', where)

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    console.log(`Found ${appointments.length} appointments`)
    
    // Log the first few appointments for debugging
    if (appointments.length > 0) {
      console.log('Sample appointments:', appointments.slice(0, 2))
    }

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

    console.log('Creating appointment with data:', {
      patientId,
      date,
      time,
      type,
      status,
      notes
    })

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

    console.log('Created appointment:', appointment)

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