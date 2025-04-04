import { prisma } from '@/lib/prisma'
import { doctorSchema } from '@/lib/validations'
import { sendApiResponse, handleApiError } from '@/lib/api-utils'
import bcrypt from 'bcryptjs'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
    })

    if (!doctor) {
      return sendApiResponse(undefined, 'Doctor not found', 404)
    }

    return sendApiResponse(doctor)
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return handleApiError(error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { password, ...updateData } = data

    // Validate update data
    const validation = doctorSchema.partial().safeParse(updateData)
    if (!validation.success) {
      return sendApiResponse(undefined, validation.error.message, 400)
    }

    // If hasLogin is true and password is provided, create a user account
    if (updateData.hasLogin && password) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create or update the user account
      await prisma.user.upsert({
        where: { email: updateData.email },
        create: {
          email: updateData.email,
          name: updateData.name,
          password: hashedPassword,
          role: 'DOCTOR'
        },
        update: {
          password: hashedPassword,
          name: updateData.name
        }
      })
    } else if (!updateData.hasLogin) {
      // If hasLogin is false, delete the user account if it exists
      await prisma.user.deleteMany({
        where: { email: updateData.email }
      })
    }

    const doctor = await prisma.doctor.update({
      where: { id: params.id },
      data: validation.data
    })

    return sendApiResponse(doctor)
  } catch (error) {
    console.error('Error updating doctor:', error)
    return handleApiError(error)
  }
} 