import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { doctorSchema } from '@/lib/validations'
import { sendApiResponse, handleApiError, requireRole } from '@/lib/api-utils'
import { logger } from '@/lib/logger'
import { NextRequest } from 'next/server'

// GET /api/doctors - Get all doctors
export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching all doctors', request)
    const session = await getServerSession(authOptions)

    if (!session) {
      logger.warn('Unauthorized access attempt to fetch doctors', request)
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    // Check if user has required role
    const roleCheckResult = await requireRole(request, ['ADMIN', 'DOCTOR'])
    if (roleCheckResult) {
      logger.warn('Role check failed for fetching doctors', request)
      return roleCheckResult
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        status: 'Active'
      },
      select: {
        id: true,
        prefix: true,
        name: true,
        phoneNumber: true,
        faxNumber: true,
        email: true,
        clinicName: true,
        address: true,
        mapLink: true,
        status: true,
        hasLogin: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    logger.info(`Successfully fetched ${doctors.length} doctors`, request)
    return sendApiResponse(doctors)
  } catch (error) {
    logger.error('Error fetching doctors', error as Error, request)
    return handleApiError(error)
  }
}

// POST /api/doctors - Create a new doctor
export async function POST(request: NextRequest) {
  try {
    logger.info('Creating new doctor', request)
    const session = await getServerSession(authOptions)

    if (!session) {
      logger.warn('Unauthorized access attempt to create doctor', request)
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    // Check if user has required role
    const roleCheckResult = await requireRole(request, ['ADMIN'])
    if (roleCheckResult) {
      logger.warn('Role check failed for creating doctor', request)
      return roleCheckResult
    }

    let data
    try {
      data = await request.json()
    } catch (e) {
      logger.error('Failed to parse request body:', e)
      return sendApiResponse(undefined, 'Invalid request body', 400)
    }

    const validationResult = doctorSchema.safeParse(data)

    if (!validationResult.success) {
      logger.warn('Validation failed for creating doctor', { error: validationResult.error.message })
      return sendApiResponse(undefined, validationResult.error.message, 400)
    }

    try {
      const doctor = await prisma.doctor.create({
        data: validationResult.data
      })

      logger.info('Doctor created successfully', { doctorId: doctor.id })
      return sendApiResponse(doctor)
    } catch (dbError) {
      if (dbError instanceof Error) {
        logger.error('Database error creating doctor:', { error: dbError.message })
      } else {
        logger.error('Database error creating doctor:', { error: 'Unknown error' })
      }
      return sendApiResponse(undefined, 'Failed to create doctor in database', 500)
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error creating doctor:', { error: error.message })
    } else {
      logger.error('Error creating doctor:', { error: 'Unknown error' })
    }
    return sendApiResponse(undefined, 'Failed to create doctor', 500)
  }
}

// PUT /api/doctors/:id - Update a doctor
export async function PUT(request: NextRequest) {
  try {
    logger.info('Updating doctor', request)
    const session = await getServerSession(authOptions)

    if (!session) {
      logger.warn('Unauthorized access attempt to update doctor', request)
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    // Check if user has required role
    const roleCheck = requireRole(request, ['ADMIN'])
    if (roleCheck) {
      logger.warn('Role check failed for updating doctor', request)
      return roleCheck
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      logger.warn('Doctor ID missing in update request', request)
      return sendApiResponse(undefined, 'Doctor ID is required', 400)
    }

    // Validate update data
    const validation = doctorSchema.partial().safeParse(updateData)
    if (!validation.success) {
      logger.warn('Invalid doctor update data provided', request)
      return sendApiResponse(undefined, validation.error.message, 400)
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: validation.data
    })

    logger.info(`Successfully updated doctor with ID: ${id}`, request)
    return sendApiResponse(doctor)
  } catch (error) {
    logger.error('Error updating doctor', error as Error, request)
    return handleApiError(error)
  }
}

// DELETE /api/doctors/:id - Delete a doctor
export async function DELETE(request: NextRequest) {
  try {
    logger.info('Deleting doctor', request)
    const session = await getServerSession(authOptions)

    if (!session) {
      logger.warn('Unauthorized access attempt to delete doctor', request)
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    // Check if user has required role
    const roleCheck = requireRole(request, ['ADMIN'])
    if (roleCheck) {
      logger.warn('Role check failed for deleting doctor', request)
      return roleCheck
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      logger.warn('Doctor ID missing in delete request', request)
      return sendApiResponse(undefined, 'Doctor ID is required', 400)
    }

    await prisma.doctor.update({
      where: { id },
      data: { status: 'Inactive' }
    })

    logger.info(`Successfully deleted doctor with ID: ${id}`, request)
    return sendApiResponse({ message: 'Doctor deleted successfully' })
  } catch (error) {
    logger.error('Error deleting doctor', error as Error, request)
    return handleApiError(error)
  }
} 