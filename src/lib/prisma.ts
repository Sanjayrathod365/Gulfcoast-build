import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Set a fallback DATABASE_URL for development only
if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
  // This is a fallback and should only be used in development
  process.env.DATABASE_URL = "mongodb+srv://username:password@cluster.mongodb.net/gulfcoast?retryWrites=true&w=majority"
  console.warn('Using fallback DATABASE_URL. Please set the actual DATABASE_URL in your environment variables.')
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma } 