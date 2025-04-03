import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exams = await prisma.exam.findMany({
      include: {
        subExams: {
          select: {
            id: true,
            name: true,
            price: true,
            examId: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(exams)
  } catch (error) {
    console.error('[EXAMS_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, subExams } = body

    // Create exam with sub-exams
    const exam = await prisma.exam.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        subExams: {
          create: subExams.map((subExam: { name: string; price: number }) => ({
            name: subExam.name.trim(),
            price: subExam.price
          }))
        }
      },
      include: {
        subExams: true
      }
    })

    return NextResponse.json(exam)
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Missing exam ID' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!data.name || !data.cptCode || !data.icd10Code || !data.duration || !data.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        name: data.name,
        cptCode: data.cptCode,
        icd10Code: data.icd10Code,
        duration: parseInt(data.duration),
        price: parseFloat(data.price),
        description: data.description || null,
        status: data.status || 'active',
      },
    })

    return NextResponse.json(exam)
  } catch (error) {
    console.error('Error updating exam:', error)
    return NextResponse.json(
      { error: 'Failed to update exam' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing exam ID' },
        { status: 400 }
      )
    }

    await prisma.exam.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { error: 'Failed to delete exam' },
      { status: 500 }
    )
  }
} 