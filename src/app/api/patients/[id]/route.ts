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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        status: true,
        payer: true,
        procedures: {
          include: {
            exam: true,
            facility: true,
            physician: true,
            status: true,
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
      { error: 'Failed to fetch patient' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('PUT request received for patient ID:', params.id);
  
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('Unauthorized request - no session found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const id = await Promise.resolve(params.id)
    const body = await request.json()
    
    console.log('Received update request for patient:', id)
    console.log('Request body:', JSON.stringify(body, null, 2))

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
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { message: 'First name and last name are required' },
        { status: 400 }
      )
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        { message: 'Date of birth is required' },
        { status: 400 }
      )
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate procedures if provided
    if (procedures) {
      if (!Array.isArray(procedures)) {
        return NextResponse.json(
          { message: 'Procedures must be an array' },
          { status: 400 }
        )
      }

      for (const proc of procedures) {
        if (!proc.examId || !proc.statusId) {
          return NextResponse.json(
            { message: 'Each procedure must have an exam and status' },
            { status: 400 }
          )
        }

        if (!proc.scheduleDate) {
          return NextResponse.json(
            { message: 'Schedule date is required for all procedures' },
            { status: 400 }
          )
        }

        if (!proc.scheduleTime?.trim()) {
          return NextResponse.json(
            { message: 'Schedule time is required for all procedures' },
            { status: 400 }
          )
        }

        if (!proc.facilityId) {
          return NextResponse.json(
            { message: 'Facility is required for all procedures' },
            { status: 400 }
          )
        }

        if (!proc.physicianId) {
          return NextResponse.json(
            { message: 'Physician is required for all procedures' },
            { status: 400 }
          )
        }

        if (proc.scheduleDate && isNaN(new Date(proc.scheduleDate).getTime())) {
          return NextResponse.json(
            { message: 'Invalid schedule date format' },
            { status: 400 }
          )
        }
      }
    }

    // Set default values for required fields
    const updateData: Prisma.PatientUpdateInput = {
      firstName: firstName.trim(),
      middleName: middleName?.trim() || null,
      lastName: lastName.trim(),
      phone: phone?.trim() || null,
      altNumber: altNumber?.trim() || null,
      email: email?.trim() || null,
      gender: gender || null,
      address: address?.trim() || null,
      city: city?.trim() || null,
      zip: zip?.trim() || null,
      status: statusId ? {
        connect: { id: statusId }
      } : undefined,
      payer: payerId ? {
        connect: { id: payerId }
      } : undefined,
      lawyer: lawyer?.trim() || null,
      orderFor: orderFor?.trim() || null,
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

    console.log('Update data:', updateData)

    // Start a transaction to update patient and procedures
    console.log('Starting transaction to update patient and procedures');
    const patient = await prisma.$transaction(async (tx) => {
      try {
        console.log('Updating patient with data:', updateData);
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
            payer: true,
          },
        })
        console.log('Patient updated successfully:', updatedPatient.id);

        // Handle procedures if provided
        if (procedures && procedures.length > 0) {
          console.log(`Deleting ${procedures.length} existing procedures`);
          // Delete existing procedures
          await tx.procedure.deleteMany({
            where: { patientId: id }
          })
          console.log('Existing procedures deleted successfully');

          // Create new procedures
          for (const proc of procedures) {
            try {
              console.log('Processing procedure:', proc);
              
              // Validate required fields
              if (!proc.examId) {
                throw new Error('Exam ID is required for each procedure');
              }
              if (!proc.statusId) {
                throw new Error('Status ID is required for each procedure');
              }
              
              const procedureData: any = {
                patient: {
                  connect: { id }
                },
                exam: {
                  connect: { id: proc.examId.toString() }
                },
                scheduleDate: proc.scheduleDate ? new Date(proc.scheduleDate) : null,
                scheduleTime: proc.scheduleTime || '',
                status: {
                  connect: { id: proc.statusId.toString() }
                },
                lop: proc.lop || null,
                isCompleted: proc.isCompleted || false
              }

              // Only add facility if provided
              if (proc.facilityId) {
                procedureData.facility = {
                  connect: { id: proc.facilityId.toString() }
                }
              }

              // Only add physician if provided
              if (proc.physicianId) {
                procedureData.physician = {
                  connect: { id: proc.physicianId.toString() }
                }
              }

              console.log('Creating procedure with data:', procedureData)
              const createdProcedure = await tx.procedure.create({
                data: procedureData
              })
              console.log('Procedure created successfully:', createdProcedure.id);
            } catch (error) {
              console.error('Error creating procedure:', error, 'Procedure data:', proc)
              throw new Error(`Failed to create procedure: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }
          console.log('All procedures created successfully');
        } else {
          console.log('No procedures to create');
        }

        return updatedPatient
      } catch (error) {
        console.error('Transaction error:', error)
        throw error
      }
    })
    console.log('Transaction completed successfully');

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)
    
    // Ensure we always return a properly formatted error response
    let errorMessage = 'Error updating patient. Please try again.';
    let statusCode = 500;
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = `Database error: ${error.message}`;
      statusCode = 400;
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      errorMessage = `Validation error: ${error.message}`;
      statusCode = 400;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: statusCode }
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