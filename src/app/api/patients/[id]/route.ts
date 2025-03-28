import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id)
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        procedures: true,
        referringDoctor: true,
        payer: true,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { message: 'Error fetching patient' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
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
      status,
      payerId,
      lawyer,
      orderDate,
      orderFor,
      referringDoctorId,
    } = body

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !payerId) {
      return NextResponse.json(
        { message: 'First name, last name, and payer are required' },
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
      doidol: doidol?.trim() || null,
      gender: gender || 'unknown',
      address: address?.trim() || '',
      city: city?.trim() || '',
      zip: zip?.trim() || '',
      status: status || 'active',
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

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
      include: {
        procedures: true,
        referringDoctor: true,
        payer: true,
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