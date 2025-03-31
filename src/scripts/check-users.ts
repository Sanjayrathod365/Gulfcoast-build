import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Checking users in database...')
    const users = await prisma.user.findMany()
    console.log('Users found:', JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 