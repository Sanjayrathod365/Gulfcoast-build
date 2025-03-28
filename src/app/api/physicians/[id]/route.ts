import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const physician = await prisma.physician.findUnique({
      where: { id: params.id },
    })

    if (!physician) {
      return NextResponse.json(
        { message: 'Physician not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(physician)
  } catch (error) {
    console.error('Error fetching physician:', error)
    return NextResponse.json(
      { message: 'Failed to fetch physician' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const physician = await prisma.physician.update({
      where: { id: params.id },
      data: {
        prefix: data.prefix,
        name: data.name,
        suffix: data.suffix,
        phoneNumber: data.phoneNumber,
        email: data.email,
        npiNumber: data.npiNumber,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(physician)
  } catch (error) {
    console.error('Error updating physician:', error)
    return NextResponse.json(
      { message: 'Failed to update physician' },
      { status: 500 }
    )
  }
} 