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
        appointments: true,
        cases: true,
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json(
      { message: 'Error fetching patients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const createData: Prisma.PatientCreateInput = {
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      dateOfBirth: new Date(data.dateOfBirth),
      phone: data.phone,
      altNumber: data.altNumber || null,
      email: data.email || null,
      gender: data.gender || null,
      address: data.address || null,
      city: data.city || null,
      zip: data.zip || null,
      lawyer: data.lawyer || null,
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      orderFor: data.orderFor || null,
      ...(data.statusId && {
        status: {
          connect: { id: data.statusId }
        }
      }),
      ...(data.payerId && {
        payer: {
          connect: { id: data.payerId }
        }
      })
    }

    const patient = await prisma.patient.create({
      data: createData,
      include: {
        status: true,
        payer: true,
        appointments: true,
        cases: true
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

    const data = await request.json()

    // Validate required fields
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      return NextResponse.json(
        { message: 'First name and last name are required' },
        { status: 400 }
      )
    }

    const updateData: Prisma.PatientUpdateInput = {
      firstName: data.firstName.trim(),
      middleName: data.middleName?.trim() || null,
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      phone: data.phone?.trim() || null,
      altNumber: data.altNumber?.trim() || null,
      email: data.email?.trim() || null,
      gender: data.gender || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      zip: data.zip?.trim() || null,
      lawyer: data.lawyer?.trim() || null,
      orderDate: data.orderDate ? new Date(data.orderDate) : undefined,
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
      })
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: updateData,
      include: {
        status: true,
        payer: true,
        appointments: true,
        cases: true
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