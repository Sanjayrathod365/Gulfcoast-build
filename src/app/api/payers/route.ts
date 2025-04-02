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

    const payers = await prisma.payer.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(payers)
  } catch (error) {
    console.error('Error fetching payers:', error)
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

    const payer = await prisma.payer.create({
      data: {
        name: data.name,
        isActive: true
      }
    })

    return NextResponse.json(payer)
  } catch (error) {
    console.error('Error creating payer:', error)
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

    const payer = await prisma.payer.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(payer)
  } catch (error) {
    console.error('Error updating payer:', error)
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
        { error: 'Payer ID is required' },
        { status: 400 }
      )
    }

    await prisma.payer.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Payer deleted successfully' })
  } catch (error) {
    console.error('Error deleting payer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 