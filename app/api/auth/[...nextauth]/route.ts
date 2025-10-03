import prisma from "@/lib/prismaClient"
import NextAuth, { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter both email and password")
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user) {
                    throw new Error("No user found with this email")
                }

                const isValid = await bcrypt.compare(credentials.password as string, (user as any).passwordHash)
                if (!isValid) {
                    throw new Error("Invalid password")
                }

                return user
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                // Ensure user exists in DB
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                })

                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            email: user.email!,
                            name: user.name ?? null,
                        },
                    })
                }
            }
            return true
        },

        async session({ session, token }) {
            if (session.user && token.sub) {
                (session.user as any).id = token.sub
            }
            return session
        },
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
