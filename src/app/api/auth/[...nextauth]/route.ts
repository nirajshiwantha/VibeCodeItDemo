import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Development login - hardcoded admin credentials
        if (credentials.username === "admin" && credentials.password === "admin@123") {
          // Check if admin user exists in database
          let adminUser = await prisma.user.findUnique({
            where: { email: "admin@nutritrack.dev" }
          })

          // Create admin user if doesn't exist
          if (!adminUser) {
            const hashedPassword = await bcrypt.hash("admin@123", 12)
            adminUser = await prisma.user.create({
              data: {
                email: "admin@nutritrack.dev",
                name: "Admin User",
                image: null,
                emailVerified: new Date(),
                // Store hashed password in a custom field (you might want to add this to schema)
              }
            })
          }

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            image: adminUser.image,
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt", // Use JWT for credentials provider
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id: string }).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 