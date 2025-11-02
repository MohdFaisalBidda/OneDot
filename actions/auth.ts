"use server"

import { CreateUser } from "@/app/validations/auth"
import prisma from "@/lib/prismaClient"
import bcrypt from "bcrypt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function registerUser(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const result = CreateUser.safeParse(rawData)

  if (!result.success) {
    const fieldErrors: Record<string, string> = {}

    result.error.issues.forEach(issue => {
      const fieldName = issue.path[0] as string
      fieldErrors[fieldName] = issue.message
    })
    return { error: "Validation failed", fieldErrors }
  }

  const { name, email, password } = result.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "User already exists" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
    },
  })

  return { 
    success: true, 
    user: { 
      id: newUser.id, 
      email: newUser.email, 
      name: newUser.name,
      userNumber: newUser.userNumber,
      isLifetimeFree: newUser.isLifetimeFree 
    } 
  }
}


export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}

export async function getRemainingSlots() {
  try {
    const userCount = await prisma.user.count();
    const remaining = Math.max(0, 100 - userCount);
    
    return { remaining, total: 100, claimed: userCount };
  } catch (error) {
    console.error("Error getting remaining slots:", error);
    return { remaining: 0, total: 100, claimed: 100 };
  }
}
