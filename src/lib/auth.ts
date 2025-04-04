import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { DefaultSession } from 'next-auth'

// Extend the built-in session types
declare module 'next-auth' {
  interface User {
    role: string
  }
  interface Session {
    user: {
      role: string
    } & DefaultSession['user']
  }
}

// Fallback secret for development and testing
// In production, always use the environment variable
const FALLBACK_SECRET = "this_is_a_fallback_secret_do_not_use_in_production_b54df4b0c8a6c3e1"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            throw new Error('Please enter an email and password')
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log('No user found')
            throw new Error('No user found with this email')
          }

          const isPasswordValid = await compare(credentials.password, user.password || '')

          if (!isPasswordValid) {
            console.log('Invalid password')
            throw new Error('Invalid password')
          }

          console.log('Login successful')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
  debug: process.env.NODE_ENV === 'development',
} 