import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        status: true,
        payer: true,
        referringDoctor: {
          select: {
            id: true,
            name: true,
          },
        },
        procedures: {
          include: {
            status: true,
            facility: true,
            physician: true,
          },
          orderBy: {
            scheduleDate: 'desc',
          },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient data' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id)
    const body = await request.json()
    const {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      phone,
      altNumber,
      email,
      doidol,
      gender,
      address,
      city,
      zip,
      statusId,
      payerId,
      lawyer,
      attorneyId,
      orderDate,
      orderFor,
      referringDoctorId,
      procedures,
    } = body

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !payerId || !statusId) {
      return NextResponse.json(
        { message: 'First name, last name, payer, and status are required' },
        { status: 400 }
      )
    }

    // Set default values for required fields
    const updateData: Prisma.PatientUpdateInput = {
      firstName: firstName.trim(),
      middleName: middleName?.trim() || '',
      lastName: lastName.trim(),
      phone: phone?.trim() || '',
      altNumber: altNumber?.trim() || '',
      email: email?.trim() || '',
      doidol: doidol ? doidol : null,
      gender: gender || 'unknown',
      address: address?.trim() || '',
      city: city?.trim() || '',
      zip: zip?.trim() || '',
      status: {
        connect: { id: statusId }
      },
      payer: {
        connect: { id: payerId }
      },
      lawyer: lawyer?.trim() || null,
      orderFor: orderFor?.trim() || '',
      referringDoctor: referringDoctorId ? {
        connect: { id: referringDoctorId }
      } : undefined,
    }

    // Update dates if provided
    if (dateOfBirth) {
      const parsedDateOfBirth = new Date(dateOfBirth)
      if (!isNaN(parsedDateOfBirth.getTime())) {
        updateData.dateOfBirth = parsedDateOfBirth
      }
    }

    if (orderDate) {
      const parsedOrderDate = new Date(orderDate)
      if (!isNaN(parsedOrderDate.getTime())) {
        updateData.orderDate = parsedOrderDate
      }
    }

    // Start a transaction to update patient and procedures
    const patient = await prisma.$transaction(async (tx) => {
      try {
        // Update patient
        const updatedPatient = await tx.patient.update({
          where: { id },
          data: updateData,
          include: {
            procedures: {
              include: {
                status: true,
                facility: true,
                physician: true,
              },
              orderBy: {
                scheduleDate: 'desc',
              },
            },
            referringDoctor: true,
            payer: true,
          },
        })

        // Handle attorney relationship through Case model
        if (attorneyId) {
          // Check if a case already exists
          const existingCase = await tx.case.findFirst({
            where: { patientId: id }
          })

          if (existingCase) {
            // Update existing case
            await tx.case.update({
              where: { id: existingCase.id },
              data: {
                attorney: {
                  connect: { id: attorneyId }
                }
              }
            })
          } else {
            // Create new case
            await tx.case.create({
              data: {
                patient: {
                  connect: { id }
                },
                attorney: {
                  connect: { id: attorneyId }
                },
                caseNumber: `CASE-${Date.now()}`, // Generate a temporary case number
                status: 'active',
                filingDate: new Date()
              }
            })
          }
        }

        // Handle procedures if provided
        if (procedures && procedures.length > 0) {
          // Delete existing procedures
          await tx.procedure.deleteMany({
            where: { patientId: id }
          })

          // Create new procedures
          for (const proc of procedures) {
            await tx.procedure.create({
              data: {
                patientId: id,
                exam: proc.examId, // Store the exam name directly
                scheduleDate: new Date(proc.scheduleDate),
                scheduleTime: proc.scheduleTime,
                facilityId: proc.facilityId,
                physicianId: proc.physicianId,
                statusId: proc.statusId,
                lop: proc.lop || null,
                isCompleted: proc.isCompleted || false
              }
            })
          }
        }

        return updatedPatient
      } catch (error) {
        console.error('Transaction error:', error)
        throw error
      }
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: `Database error: ${error.message}` },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { message: `Validation error: ${error.message}` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: 'Error updating patient. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id)
    await prisma.patient.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Patient deleted successfully' })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json(
      { message: 'Error deleting patient' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 