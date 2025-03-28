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

    const statuses = await prisma.status.findMany({
      select: {
        id: true,
        name: true,
        color: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(statuses)
  } catch (error) {
    console.error('Error fetching statuses:', error)
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

    const status = await prisma.status.create({
      data: {
        name: data.name,
        color: data.color
      }
    })

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error creating status:', error)
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

    const status = await prisma.status.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error updating status:', error)
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
        { error: 'Status ID is required' },
        { status: 400 }
      )
    }

    await prisma.status.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Status deleted successfully' })
  } catch (error) {
    console.error('Error deleting status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { operations } = body

    if (!Array.isArray(operations)) {
      return NextResponse.json(
        { message: 'Operations must be an array' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      operations.map(async (operation) => {
        const { id, action, data } = operation

        switch (action) {
          case 'update':
            return prisma.status.update({
              where: { id },
              data: {
                name: data.name?.trim(),
                description: data.description?.trim() || '',
                color: data.color?.trim()
              }
            })
          case 'delete':
            return prisma.status.delete({
              where: { id }
            })
          default:
            throw new Error(`Invalid action: ${action}`)
        }
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error performing bulk operations:', error)
    return NextResponse.json(
      { message: 'Error performing bulk operations' },
      { status: 500 }
    )
  }
} 