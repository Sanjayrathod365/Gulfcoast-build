import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        status: true,
        payer: true,
        procedures: {
          include: {
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Map the procedures to include exam name
    const patientsWithExamNames = patients.map(patient => ({
      ...patient,
      procedures: patient.procedures.map(proc => ({
        ...proc,
        exam: proc.exam // This is already the exam name from the schema
      }))
    }))

    return NextResponse.json(patientsWithExamNames)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { message: 'Error fetching patients' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const patient = await prisma.patient.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        altNumber: data.altNumber,
        email: data.email,
        doidol: data.doidol,
        gender: data.gender,
        address: data.address,
        city: data.city,
        zip: data.zip,
        statusId: data.statusId,
        payerId: data.payerId,
        lawyer: data.lawyer,
        orderDate: data.orderDate,
        orderFor: data.orderFor,
        referringDoctorId: data.referringDoctorId,
        procedures: {
          create: data.procedures.map((proc: any) => ({
            exam: proc.examId,
            scheduleDate: proc.scheduleDate,
            scheduleTime: proc.scheduleTime,
            facilityId: proc.facilityId,
            physicianId: proc.physicianId,
            statusId: proc.statusId,
            lop: proc.lop,
            isCompleted: proc.isCompleted
          }))
        }
      },
      include: {
        status: true,
        payer: true,
        referringDoctor: true,
        procedures: true
      }
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
      orderDate,
      orderFor,
      referringDoctorId,
      procedures
    } = body

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !payerId || !statusId) {
      return NextResponse.json(
        { message: 'First name, last name, payer, and status are required' },
        { status: 400 }
      )
    }

    // Set default values for required fields
    const patientData: Prisma.PatientUpdateInput = {
      firstName: firstName.trim(),
      middleName: middleName?.trim() || '',
      lastName: lastName.trim(),
      phone: phone?.trim() || '',
      altNumber: altNumber?.trim() || '',
      email: email?.trim() || '',
      doidol: doidol?.trim() || null,
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
        patientData.dateOfBirth = parsedDateOfBirth
      }
    }

    if (orderDate) {
      const parsedOrderDate = new Date(orderDate)
      if (!isNaN(parsedOrderDate.getTime())) {
        patientData.orderDate = parsedOrderDate
      }
    }

    // Handle procedures update
    if (procedures && Array.isArray(procedures)) {
      patientData.procedures = {
        deleteMany: {}, // Delete all existing procedures
        create: procedures.map((proc: any) => ({
          exam: proc.examId,
          scheduleDate: new Date(proc.scheduleDate),
          scheduleTime: proc.scheduleTime,
          facility: {
            connect: { id: proc.facilityId }
          },
          physician: {
            connect: { id: proc.physicianId }
          },
          status: {
            connect: { id: proc.statusId }
          },
          lop: proc.lop,
          isCompleted: proc.isCompleted
        }))
      }
    }

    // Update patient with validated data
    const patient = await prisma.patient.update({
      where: { id },
      data: patientData,
      include: {
        status: true,
        payer: true,
        referringDoctor: true,
        procedures: {
          include: {
            status: true
          }
        }
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json(
      { message: 'Error updating patient' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
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