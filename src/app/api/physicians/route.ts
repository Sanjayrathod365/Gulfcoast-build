import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const physicians = await prisma.physician.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(physicians)
  } catch (error) {
    console.error('Error fetching physicians:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const physician = await prisma.physician.create({
      data: {
        prefix: data.prefix || null,
        name: data.name,
        suffix: data.suffix || null,
        phoneNumber: data.phoneNumber || null,
        faxNumber: data.faxNumber || null,
        email: data.email,
        npiNumber: data.npiNumber || null,
        clinicName: data.clinicName || null,
        address: data.address || null,
        mapLink: data.mapLink || null,
        status: data.status || 'Active',
        isActive: true
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

    const physician = await prisma.physician.update({
      where: { id },
      data: {
        prefix: updateData.prefix || null,
        name: updateData.name,
        suffix: updateData.suffix || null,
        phoneNumber: updateData.phoneNumber || null,
        faxNumber: updateData.faxNumber || null,
        email: updateData.email,
        npiNumber: updateData.npiNumber || null,
        clinicName: updateData.clinicName || null,
        address: updateData.address || null,
        mapLink: updateData.mapLink || null,
        status: updateData.status || 'Active',
        isActive: updateData.isActive
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