import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface AppointmentData {
  id?: string
  patientId: string
  doctorId: string
  examId: string | null
  date: string
  time: string
  type: string
  status?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { appointments } = data

    console.log('Syncing appointments:', appointments)

    // Create or update appointments
    const results = await Promise.all(
      appointments.map(async (appointment: AppointmentData) => {
        try {
          // Convert date string to Date object
          const appointmentDate = new Date(appointment.date)
          appointmentDate.setHours(0, 0, 0, 0)

          // Create or update the appointment
          const result = await prisma.appointment.upsert({
            where: {
              id: appointment.id || 'new', // If no ID, use 'new' to force create
            },
            create: {
              patientId: appointment.patientId,
              doctorId: appointment.doctorId,
              examId: appointment.examId,
              date: appointmentDate,
              time: appointment.time,
              type: appointment.type,
              status: appointment.status || 'scheduled',
              notes: appointment.notes,
            },
            update: {
              patientId: appointment.patientId,
              doctorId: appointment.doctorId,
              examId: appointment.examId,
              date: appointmentDate,
              time: appointment.time,
              type: appointment.type,
              status: appointment.status || 'scheduled',
              notes: appointment.notes,
            },
            include: {
              patient: true,
            },
          })

          console.log('Synced appointment:', result)
          return { success: true, data: result }
        } catch (error) {
          console.error('Error syncing appointment:', error)
          return { success: false, error }
        }
      })
    )

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`Sync complete. Success: ${successCount}, Failures: ${failureCount}`)

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${successCount} appointments. Failed: ${failureCount}`,
      results
    })
  } catch (error) {
    console.error('Error in sync endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to sync appointments' },
      { status: 500 }
    )
  }
} 