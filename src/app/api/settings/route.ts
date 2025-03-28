import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all settings
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.settings.create({
        data: {
          companyName: 'Gulf Coast Medical',
          companyAddress: '',
          companyPhone: '',
          companyEmail: '',
          businessHours: {
            monday: { open: '09:00', close: '17:00' },
            tuesday: { open: '09:00', close: '17:00' },
            wednesday: { open: '09:00', close: '17:00' },
            thursday: { open: '09:00', close: '17:00' },
            friday: { open: '09:00', close: '17:00' },
            saturday: { open: '09:00', close: '12:00' },
            sunday: { open: '', close: '' }
          },
          appointmentDuration: 30,
          notificationPreferences: {
            email: true,
            sms: true
          }
        }
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { message: 'Error fetching settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      businessHours,
      appointmentDuration,
      notificationPreferences
    } = body

    // Update settings
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        businessHours,
        appointmentDuration,
        notificationPreferences
      },
      create: {
        id: 1,
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        businessHours,
        appointmentDuration,
        notificationPreferences
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { message: 'Error updating settings' },
      { status: 500 }
    )
  }
} 