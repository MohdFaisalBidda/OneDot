import prisma from "@/lib/prismaClient"
import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

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

                const isValid = await bcrypt.compare(credentials.password as string, (user as any).password)
                if (!isValid) {
                    throw new Error("Invalid password")
                }

                return user
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                    include: { providers: true },
                });

                if (!existingUser) {
                    // Create new user and link Google provider
                    const newUser = await prisma.user.create({
                        data: {
                            email: user.email!,
                            name: user.name ?? null,
                            providers: {
                                create: {
                                    provider: "google",
                                    providerId: account.providerAccountId,
                                },
                            },
                        },
                    });
                    return !!newUser;
                } else {
                    // Check if Google provider already linked
                    const hasProvider = existingUser.providers.some(
                        (p) => p.provider === "google" && p.providerId === account.providerAccountId
                    );

                    if (!hasProvider) {
                        await prisma.authProvider.create({
                            data: {
                                provider: "google",
                                providerId: account.providerAccountId,
                                userId: existingUser.id,
                            },
                        });
                    }
                    return true;
                }
            }

            return true;
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
    debug: true
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
