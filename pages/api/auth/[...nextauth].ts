import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "../../../lib/prisma"
import { compare, hash } from "bcrypt"

interface CustomUser extends NextAuthUser {
  role?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        if (credentials.action === 'register') {
          const existingUser = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (existingUser) {
            throw new Error('User already exists')
          }

          const hashedPassword = await hash(credentials.password, 10)
          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || null,
              password: hashedPassword,
              role: 'USER'  // Default role for new users
            }
          })

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } else {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            throw new Error('No user found')
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as CustomUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)