import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendApiResponse, handleApiError } from '@/lib/api-utils'
import { logger } from '@/lib/logger'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
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
    })

    if (!patient) {
      return sendApiResponse(undefined, 'Patient not found', 404)
    }

    logger.info(`Fetched patient: ${patient.id}`, request)
    return sendApiResponse(patient)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    const data = await request.json()
    logger.info(`Received update request for patient: ${params.id}`, request)

    // Validate required fields
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      return sendApiResponse(undefined, 'First name and last name are required', 400)
    }

    // Update the patient with procedures in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        // Update the patient
        const patient = await tx.patient.update({
          where: { id: params.id },
          data: {
            firstName: data.firstName.trim(),
            middleName: data.middleName?.trim() || null,
            lastName: data.lastName.trim(),
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            gender: data.gender || null,
            phone: data.phone?.trim() || null,
            altNumber: data.altNumber?.trim() || null,
            email: data.email?.trim() || null,
            address: data.address?.trim() || null,
            city: data.city?.trim() || null,
            zip: data.zip?.trim() || null,
            lawyer: data.lawyer?.trim() || null,
            orderFor: data.orderFor?.trim() || null,
            orderDate: data.orderDate ? new Date(data.orderDate) : null,
            status: data.statusId ? {
              connect: { id: data.statusId }
            } : undefined,
            payer: data.payerId ? {
              connect: { id: data.payerId }
            } : undefined
          }
        })
        logger.info(`Updated patient: ${patient.id}`, request)

        // Update procedures if provided
        if (data.procedures && data.procedures.length > 0) {
          // Delete existing procedures
          await tx.procedure.deleteMany({
            where: { patientId: params.id }
          })
          logger.info(`Deleted existing procedures for patient: ${params.id}`, request)

          // Create new procedures
          for (const proc of data.procedures) {
            const procedureData = {
              patient: {
                connect: { id: params.id }
              },
              exam: {
                connect: { id: proc.examId }
              },
              status: {
                connect: { id: proc.statusId }
              },
              facility: {
                connect: { id: proc.facilityId }
              },
              physician: {
                connect: { id: proc.physicianId }
              },
              scheduleDate: proc.scheduleDate ? new Date(proc.scheduleDate) : new Date(),
              scheduleTime: proc.scheduleTime || '',
              lop: proc.lop || null,
              isCompleted: proc.isCompleted || false
            }

            const createdProcedure = await tx.procedure.create({
              data: procedureData
            })
            logger.info(`Created procedure: ${createdProcedure.id}`, request)
          }
        }

        return patient
      } catch (error) {
        logger.error('Transaction error', error instanceof Error ? error : new Error('Unknown error'), request)
        throw error
      }
    })

    logger.info('Patient update completed successfully', request)
    return sendApiResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    // Delete the patient and related records in a transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      try {
        // Delete related procedures
        await tx.procedure.deleteMany({
          where: { patientId: params.id }
        })
        logger.info(`Deleted procedures for patient: ${params.id}`, request)

        // Delete related appointments
        await tx.appointment.deleteMany({
          where: { patientId: params.id }
        })
        logger.info(`Deleted appointments for patient: ${params.id}`, request)

        // Delete the patient
        await tx.patient.delete({
          where: { id: params.id }
        })
        logger.info(`Deleted patient: ${params.id}`, request)
      } catch (error) {
        logger.error('Transaction error', error instanceof Error ? error : new Error('Unknown error'), request)
        throw error
      }
    })

    logger.info('Patient deletion completed successfully', request)
    return sendApiResponse({ message: 'Patient deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
} 