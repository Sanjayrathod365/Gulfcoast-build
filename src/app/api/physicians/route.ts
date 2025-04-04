import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const physicians = await prisma.physician.findMany({
      select: {
        id: true,
        prefix: true,
        name: true,
        suffix: true,
        phoneNumber: true,
        email: true,
        npiNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(physicians)
  } catch (error) {
    console.error('[PHYSICIANS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingPhysician = await prisma.physician.findUnique({
      where: { email: data.email }
    })

    if (existingPhysician) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const physician = await prisma.physician.create({
      data: {
        prefix: data.prefix || null,
        name: data.name.trim(),
        suffix: data.suffix || null,
        phoneNumber: data.phoneNumber || null,
        faxNumber: data.faxNumber || null,
        email: data.email.trim(),
        npiNumber: data.npiNumber || null,
        clinicName: data.clinicName || null,
        address: data.address || null,
        mapLink: data.mapLink || null,
        status: data.status || 'Active',
        isActive: data.isActive === false ? false : true
      }
    })

    return NextResponse.json(physician)
  } catch (error) {
    console.error('Error creating physician:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Physician ID is required' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Check if email already exists for other physicians
      const existingPhysician = await prisma.physician.findFirst({
        where: {
          email: updateData.email,
          NOT: { id }
        }
      })

      if (existingPhysician) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    const physician = await prisma.physician.update({
      where: { id },
      data: {
        prefix: updateData.prefix || null,
        name: updateData.name.trim(),
        suffix: updateData.suffix || null,
        phoneNumber: updateData.phoneNumber || null,
        faxNumber: updateData.faxNumber || null,
        email: updateData.email?.trim(),
        npiNumber: updateData.npiNumber || null,
        clinicName: updateData.clinicName || null,
        address: updateData.address || null,
        mapLink: updateData.mapLink || null,
        status: updateData.status || 'Active',
        isActive: updateData.isActive === false ? false : true
      }
    })

    return NextResponse.json(physician)
  } catch (error) {
    console.error('Error updating physician:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Physician ID is required' },
        { status: 400 }
      )
    }

    // Check if physician has any associated procedures
    const proceduresCount = await prisma.procedure.count({
      where: { physicianId: id }
    })

    if (proceduresCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete physician with associated procedures' },
        { status: 400 }
      )
    }

    await prisma.physician.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Physician deleted successfully' })
  } catch (error) {
    console.error('Error deleting physician:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 