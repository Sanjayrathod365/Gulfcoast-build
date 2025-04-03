import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patients = await prisma.patient.findMany({
      include: {
        status: true,
        procedures: {
          include: {
            exam: true,
            facility: true,
            physician: true,
            status: true
          },
          orderBy: {
            scheduleDate: 'desc'
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('[PATIENTS_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface Procedure {
  examId: string
  statusId: string
  scheduleDate?: string
  scheduleTime?: string
  facilityId?: string
  physicianId?: string
  lop?: string | null
  isCompleted?: boolean
  status?: {
    name: string
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Received request body:', JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.firstName || !data.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    if (!data.procedures || data.procedures.length === 0) {
      return NextResponse.json(
        { error: 'At least one procedure is required' },
        { status: 400 }
      )
    }

    // Validate each procedure
    for (const proc of data.procedures) {
      if (!proc.examId || !proc.statusId) {
        return NextResponse.json(
          { error: 'Exam and status are required for each procedure' },
          { status: 400 }
        )
      }
    }

    // Check if default facility exists, if not create it
    let defaultFacilityId = '67ed260cc52a7fd85d24a7a1'
    try {
      const facilityExists = await prisma.facility.findUnique({
        where: { id: defaultFacilityId }
      })
      
      if (!facilityExists) {
        try {
          const newFacility = await prisma.facility.create({
            data: {
              name: 'Default Facility',
              address: 'Default Address',
              city: 'Default City',
              state: 'Default State',
              zip: '00000',
              phone: '000-000-0000',
              status: 'active'
            }
          })
          defaultFacilityId = newFacility.id
        } catch (createError) {
          console.error('Error creating default facility:', createError)
          
          // If creation fails, try to find an existing facility to use
          const existingFacility = await prisma.facility.findFirst({
            where: { status: 'active' }
          })
          
          if (existingFacility) {
            defaultFacilityId = existingFacility.id
          } else {
            return NextResponse.json(
              { error: 'Failed to create default facility and no existing facility found' },
              { status: 500 }
            )
          }
        }
      }
    } catch (error) {
      console.error('Error checking/creating default facility:', error)
      return NextResponse.json(
        { error: 'Failed to create default facility' },
        { status: 500 }
      )
    }

    // Check if default physician exists, if not create it
    let defaultPhysicianId = '67ed260cc52a7fd85d24a7a2'
    try {
      const physicianExists = await prisma.physician.findUnique({
        where: { id: defaultPhysicianId }
      })
      
      if (!physicianExists) {
        // Generate a unique email for the default physician
        const uniqueEmail = `default_${Date.now()}@example.com`
        
        try {
          const newPhysician = await prisma.physician.create({
            data: {
              name: 'Default Physician',
              email: uniqueEmail,
              status: 'Active',
              isActive: true
            }
          })
          defaultPhysicianId = newPhysician.id
        } catch (createError) {
          console.error('Error creating default physician:', createError)
          
          // If creation fails, try to find an existing physician to use
          const existingPhysician = await prisma.physician.findFirst({
            where: { isActive: true }
          })
          
          if (existingPhysician) {
            defaultPhysicianId = existingPhysician.id
          } else {
            return NextResponse.json(
              { error: 'Failed to create default physician and no existing physician found' },
              { status: 500 }
            )
          }
        }
      }
    } catch (error) {
      console.error('Error checking/creating default physician:', error)
      return NextResponse.json(
        { error: 'Failed to create default physician' },
        { status: 500 }
      )
    }

    // Create the patient with basic info first
    const patient = await prisma.patient.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || '',
        dateOfBirth: new Date(data.dateOfBirth),
        middleName: data.middleName || '',
        altNumber: data.altNumber || '',
        doidol: data.doidol ? new Date(data.doidol) : null,
        gender: data.gender || 'unknown',
        address: data.address || '',
        city: data.city || '',
        zip: data.zip || '',
        lawyer: data.lawyer || '',
        orderDate: data.orderDate ? new Date(data.orderDate) : null,
        orderFor: data.orderFor || '',
        status: {
          connect: {
            id: data.statusId || '67ed260cc52a7fd85d24a7a0'
          }
        },
        procedures: {
          create: data.procedures.map((proc: any) => {
            const procedureData: any = {
              exam: {
                connect: {
                  id: proc.examId
                }
              },
              status: {
                connect: {
                  id: proc.statusId
                }
              },
              scheduleDate: new Date(proc.scheduleDate),
              scheduleTime: proc.scheduleTime || '00:00',
              lop: proc.lop || null,
              isCompleted: proc.isCompleted || false
            };
            
            // Only add facility if it exists
            if (proc.facilityId || defaultFacilityId) {
              procedureData.facility = {
                connect: {
                  id: proc.facilityId || defaultFacilityId
                }
              };
            }
            
            // Only add physician if it exists
            if (proc.physicianId || defaultPhysicianId) {
              procedureData.physician = {
                connect: {
                  id: proc.physicianId || defaultPhysicianId
                }
              };
            }
            
            return procedureData;
          })
        }
      },
      include: {
        status: true,
        payer: true,
        procedures: {
          include: {
            exam: true,
            status: true,
            facility: true,
            physician: true
          }
        }
      }
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('[PATIENTS_POST] Error details:', error)
    return NextResponse.json(
      { error: 'Failed to create patient. Please check all required fields.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Patient ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      return NextResponse.json(
        { message: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Validate procedures if provided
    if (data.procedures && data.procedures.length > 0) {
      for (const proc of data.procedures) {
        // Validate required fields for procedures
        if (!proc.examId || !proc.statusId) {
          return NextResponse.json({ 
            error: "Exam and status are required for each procedure" 
          }, { status: 400 })
        }

        // Validate time format if provided
        if (proc.scheduleTime) {
          // Ensure time is in HH:mm:ss format
          const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
          if (!timeRegex.test(proc.scheduleTime)) {
            return NextResponse.json({
              error: "Invalid time format. Please use HH:mm:ss format"
            }, { status: 400 })
          }
        }
      }
    }

    const updateData: Prisma.PatientUpdateInput = {
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      phone: data.phone?.trim() || null,
      altNumber: data.altNumber?.trim() || null,
      email: data.email?.trim() || null,
      gender: data.gender || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      zip: data.zip?.trim() || null,
      lawyer: data.lawyer?.trim() || null,
      orderDate: data.orderDate ? new Date(data.orderDate) : null,
      orderFor: data.orderFor?.trim() || null,
      ...(data.statusId && {
        status: {
          connect: { id: data.statusId }
        }
      }),
      ...(data.payerId && {
        payer: {
          connect: { id: data.payerId }
        }
      }),
      // Handle procedures update/deletion
      procedures: {
        // First delete all existing procedures
        deleteMany: {
          patientId: id
        },
        // Then create new ones if any are provided
        ...(data.procedures && data.procedures.length > 0 ? {
          create: data.procedures.map((proc: Procedure) => ({
            examId: proc.examId,
            statusId: proc.statusId,
            scheduleDate: proc.scheduleDate ? new Date(proc.scheduleDate) : null,
            scheduleTime: proc.scheduleTime || null,
            facilityId: proc.facilityId || null,
            physicianId: proc.physicianId || null,
            lop: proc.lop || null,
            isCompleted: proc.isCompleted || false
          }))
        } : {})
      }
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
      include: {
        status: true,
        payer: true,
        procedures: {
          include: {
            exam: true,
            status: true,
            facility: true,
            physician: true
          }
        }
      }
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Patient ID is required' },
        { status: 400 }
      )
    }

    await prisma.patient.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Patient deleted successfully' })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format dates consistently
function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
} 