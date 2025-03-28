import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payer = await prisma.payer.findUnique({
      where: {
        id: params.id
      }
    })

    if (!payer) {
      return NextResponse.json(
        { error: 'Payer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(payer)
  } catch (error) {
    console.error('Error fetching payer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 