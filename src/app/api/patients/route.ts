import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendApiResponse, handleApiError } from '@/lib/api-utils'
import { logger } from '@/lib/logger'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

type PatientWithRelations = {
  id: string
  firstName: string
  lastName: string
  middleName?: string | null
  dateOfBirth?: Date | null
  gender?: string | null
  phone?: string | null
  altNumber?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  zip?: string | null
  lawyer?: string | null
  orderFor?: string | null
  orderDate?: Date | null
  statusId?: string
  payerId?: string
  status?: {
    id: string
    name: string
  } | null
  payer?: {
    id: string
    name: string
  } | null
  procedures?: Array<{
    id: string
    examId: string
    statusId: string
    scheduleDate?: Date
    scheduleTime?: string
    facilityId?: string
    physicianId?: string
    lop?: string | null
    isCompleted?: boolean
    exam?: {
      id: string
      name: string
    } | null
    facility?: {
      id: string
      name: string
    } | null
    physician?: {
      id: string
      name: string
    } | null
    status?: {
      id: string
      name: string
    } | null
  }>
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    const patients = await prisma.patient.findMany({
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      include: {
        status: true,
        payer: true,
        appointments: {
          include: {
            doctor: true,
            exam: true,
            status: true
          }
        },
        procedures: {
          include: {
            exam: true,
            facility: true,
            physician: true,
            status: true
          }
        }
      }
    });

    const patientsWithFullName = patients.map((patient: PatientWithRelations) => ({
      ...patient,
      fullName: `${patient.lastName}, ${patient.firstName}`
    }));

    logger.info(`Fetched ${patients.length} patients`, request);
    return sendApiResponse(patientsWithFullName);
  } catch (error) {
    return handleApiError(error);
  }
}

type ProcedureInput = {
  examId: string
  statusId: string
  scheduleDate?: string
  scheduleTime?: string
  facilityId?: string
  physicianId?: string
  lop?: string | null
  isCompleted?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    const data = await request.json()
    logger.info('Received patient creation request', request)

    // Validate required fields
    if (!data.firstName || !data.lastName) {
      return sendApiResponse(undefined, 'First name and last name are required', 400)
    }

    if (!data.procedures || data.procedures.length === 0) {
      return sendApiResponse(undefined, 'At least one procedure is required', 400)
    }

    // Validate each procedure
    for (const proc of data.procedures) {
      if (!proc.examId || !proc.statusId) {
        return sendApiResponse(undefined, 'Exam and status are required for each procedure', 400)
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
          logger.info(`Created default facility: ${newFacility.id}`, request)
        } catch (createError) {
          logger.error('Error creating default facility', createError instanceof Error ? createError : new Error('Unknown error'), request)
          
          // If creation fails, try to find an existing facility to use
          const existingFacility = await prisma.facility.findFirst({
            where: { status: 'active' }
          })
          
          if (existingFacility) {
            defaultFacilityId = existingFacility.id
            logger.info(`Using existing facility: ${existingFacility.id}`, request)
          } else {
            return sendApiResponse(undefined, 'Failed to create default facility and no existing facility found', 500)
          }
        }
      }
    } catch (error) {
      logger.error('Error checking/creating default facility', error instanceof Error ? error : new Error('Unknown error'), request)
      return sendApiResponse(undefined, 'Failed to create default facility', 500)
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
          logger.info(`Created default physician: ${newPhysician.id}`, request)
        } catch (createError) {
          logger.error('Error creating default physician', createError instanceof Error ? createError : new Error('Unknown error'), request)
          
          // If creation fails, try to find an existing physician to use
          const existingPhysician = await prisma.physician.findFirst({
            where: { isActive: true }
          })
          
          if (existingPhysician) {
            defaultPhysicianId = existingPhysician.id
            logger.info(`Using existing physician: ${existingPhysician.id}`, request)
          } else {
            return sendApiResponse(undefined, 'Failed to create default physician and no existing physician found', 500)
          }
        }
      }
    } catch (error) {
      logger.error('Error checking/creating default physician', error instanceof Error ? error : new Error('Unknown error'), request)
      return sendApiResponse(undefined, 'Failed to create default physician', 500)
    }

    // Create the patient with procedures in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        // Create the patient
        const patient = await tx.patient.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender,
            phone: data.phone,
            altNumber: data.altNumber,
            email: data.email,
            address: data.address,
            city: data.city,
            zip: data.zip,
            lawyer: data.lawyer,
            orderFor: data.orderFor,
            orderDate: data.orderDate ? new Date(data.orderDate) : null,
            statusId: data.statusId,
            payerId: data.payerId,
            procedures: {
              create: data.procedures.map((proc: ProcedureInput) => ({
                examId: proc.examId,
                statusId: proc.statusId,
                scheduleDate: proc.scheduleDate ? new Date(proc.scheduleDate) : null,
                scheduleTime: proc.scheduleTime,
                facilityId: proc.facilityId,
                physicianId: proc.physicianId,
                lop: proc.lop,
                isCompleted: proc.isCompleted || false
              }))
            }
          },
          include: {
            status: true,
            payer: true,
            procedures: {
              include: {
                exam: true,
                facility: true,
                physician: true,
                status: true
              }
            }
          }
        })

        return patient
      } catch (error) {
        logger.error('Error creating patient in transaction', error instanceof Error ? error : new Error('Unknown error'), request)
        throw error
      }
    })

    logger.info(`Created patient with ID: ${result.id}`, request)
    return sendApiResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    const data = await request.json()
    logger.info('Received patient update request', request)

    // Validate required fields
    if (!data.id) {
      return sendApiResponse(undefined, 'Patient ID is required', 400)
    }

    if (!data.firstName || !data.lastName) {
      return sendApiResponse(undefined, 'First name and last name are required', 400)
    }

    // Update the patient with procedures in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        // Update the patient
        const patient = await tx.patient.update({
          where: { id: data.id },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            gender: data.gender,
            phone: data.phone,
            altNumber: data.altNumber,
            email: data.email,
            address: data.address,
            city: data.city,
            zip: data.zip,
            lawyer: data.lawyer,
            orderFor: data.orderFor,
            orderDate: data.orderDate ? new Date(data.orderDate) : null,
            statusId: data.statusId,
            payerId: data.payerId
          },
          include: {
            status: true,
            payer: true,
            procedures: {
              include: {
                exam: true,
                facility: true,
                physician: true,
                status: true
              }
            }
          }
        })

        return patient
      } catch (error) {
        logger.error('Error updating patient in transaction', error instanceof Error ? error : new Error('Unknown error'), request)
        throw error
      }
    })

    logger.info(`Updated patient with ID: ${result.id}`, request)
    return sendApiResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return sendApiResponse(undefined, 'Patient ID is required', 400)
    }

    // Delete the patient and related records in a transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        // Delete related procedures
        await tx.procedure.deleteMany({
          where: { patientId: id }
        })

        // Delete related appointments
        await tx.appointment.deleteMany({
          where: { patientId: id }
        })

        // Delete related cases
        await tx.case.deleteMany({
          where: { patientId: id }
        })

        // Delete related events
        await tx.event.deleteMany({
          where: { patientId: id }
        })

        // Delete the patient
        await tx.patient.delete({
          where: { id }
        })

        logger.info(`Deleted patient with ID: ${id}`, request)
      } catch (error) {
        logger.error('Error deleting patient in transaction', error instanceof Error ? error : new Error('Unknown error'), request)
        throw error
      }
    })

    return sendApiResponse(undefined, 'Patient deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
} 