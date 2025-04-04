import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { DefaultSession } from 'next-auth'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library'

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
      id: "credentials",
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('Auth attempt with credentials:', { email: credentials?.email });
          console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          try {
            // Test database connection
            await prisma.$connect();
            console.log('Database connection successful');
          } catch (dbError) {
            console.error('Database connection failed:', dbError);
            throw dbError;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            console.log('No user found with email:', credentials.email);
            return null;
          }

          console.log('User found:', { id: user.id, email: user.email, hasPassword: !!user.password });
          
          const isPasswordValid = await compare(credentials.password, user.password || '');

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('Login successful for:', credentials.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error details:', error);
          // Check for specific Prisma errors
          if (error instanceof PrismaClientInitializationError) {
            console.error('Database connection error:', error.message);
          }
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    // Do not specify a callback URL
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
  debug: true, // Enable debug mode to get more logging
} 