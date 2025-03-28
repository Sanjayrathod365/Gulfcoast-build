import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const doctor = await prisma.doctor.update({
      where: { id: params.id },
      data: { status: data.status },
    })
    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error updating doctor status:', error)
    return NextResponse.json(
      { error: 'Failed to update doctor status' },
      { status: 500 }
    )
  }
} 