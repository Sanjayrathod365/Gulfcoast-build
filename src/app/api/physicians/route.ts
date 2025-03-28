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
        prefix: data.prefix,
        name: data.name,
        suffix: data.suffix,
        phoneNumber: data.phoneNumber,
        email: data.email,
        npiNumber: data.npiNumber,
        isActive: data.isActive ?? true
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Physician ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json()

    const physician = await prisma.physician.update({
      where: { id },
      data: {
        prefix: data.prefix,
        name: data.name,
        suffix: data.suffix,
        phoneNumber: data.phoneNumber,
        email: data.email,
        npiNumber: data.npiNumber,
        isActive: data.isActive
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