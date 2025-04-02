import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

interface CaseManagerData {
  name: string
  email: string
  phone: string
  phoneExt?: string
  faxNumber?: string
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    console.log('Updating attorney with ID:', id)

    const data = await request.json()
    console.log('Received update request:', data)

    const { password, caseManagers, ...attorneyData } = data
    console.log('Attorney Data:', attorneyData)

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update attorney profile
      const attorney = await tx.attorney.update({
        where: { id },
        data: {
          firstName: attorneyData.name?.split(' ')[0] || '',
          lastName: attorneyData.name?.split(' ').slice(1).join(' ') || '',
          email: attorneyData.email,
          phone: attorneyData.phone,
          address: attorneyData.address || null,
          city: attorneyData.city || null,
          state: attorneyData.state || null,
          zip: attorneyData.zip || null,
          user: {
            update: {
              name: attorneyData.name,
              email: attorneyData.email,
              password: password ? await bcrypt.hash(password, 10) : undefined
            }
          }
        },
        include: {
          caseManagers: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      console.log('Updated Attorney:', attorney)

      // Handle case managers if provided
      if (caseManagers && caseManagers.length > 0) {
        // Delete existing case managers
        await tx.caseManager.deleteMany({
          where: { attorneyId: id }
        })

        // Create new case managers
        const validCaseManagers = caseManagers.filter((manager: CaseManagerData) => 
          manager.name && manager.email && manager.phone
        )

        if (validCaseManagers.length > 0) {
          await tx.caseManager.createMany({
            data: validCaseManagers.map((manager: CaseManagerData) => ({
              attorneyId: id,
              firstName: manager.name.split(' ')[0] || '',
              lastName: manager.name.split(' ').slice(1).join(' ') || '',
              email: manager.email,
              phone: manager.phone
            }))
          })
        }
      }

      // Always fetch and return the updated attorney with case managers
      return await tx.attorney.findUnique({
        where: { id },
        include: {
          caseManagers: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating attorney:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: `Database error: ${error.message}` },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update attorney' },
      { status: 500 }
    )
  }
} 