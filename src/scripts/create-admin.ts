import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create admin user
    const adminPassword = await hash('admin123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@gulfcoast.com' },
      update: {},
      create: {
        email: 'admin@gulfcoast.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    console.log('Admin user created/updated:', admin)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 