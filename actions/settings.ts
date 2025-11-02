"use server"

import bcrypt from "bcrypt"
import { requireUser } from "@/actions/auth"
import prisma from "@/lib/prismaClient"
import { revalidatePath } from "next/cache"

// Profile Actions
export async function updateProfile(formData: FormData) {
  try {
    const user = await requireUser()

    const name = formData.get("name") as string
    const bio = formData.get("bio") as string

    if (!name?.trim()) {
      return { error: "Name is required" }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        bio: bio?.trim() || null,
      },
    })

    revalidatePath("/dashboard/settings/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Failed to update profile" }
  }
}

export async function getUserProfile() {
  try {
    const user = await requireUser()

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Account Actions
export async function changePassword(formData: FormData) {
  try {
    const user = await requireUser()

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: "All password fields are required" }
    }

    if (newPassword !== confirmPassword) {
      return { error: "New passwords do not match" }
    }

    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters long" }
    }

    // Verify current password
    if (!user.password) {
      return { error: "Cannot change password for this account type" }
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return { error: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return { success: true }
  } catch (error) {
    console.error("Error changing password:", error)
    return { error: "Failed to change password" }
  }
}

export async function addPassword(formData: FormData) {
  try {
    const user = await requireUser();
    // If user already has a password, use the change password flow
    if (user.password) {
      return { error: "Password already exists. Use change password instead." };
    }

    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || !confirmPassword) {
      return { error: "All password fields are required" };
    }
    
    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    if (newPassword.length < 6) {
      return { error: "Password must be at least 6 characters long" };
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding password:", error);
    return { error: "Failed to add password" };
  }
}

// Preferences Actions
export async function updatePreferences(formData: FormData) {
  try {
    const user = await requireUser()

    const theme = formData.get("theme") as string
    // const pushNotifications = formData.get("pushNotifications") === "on"
    // const emailDigest = formData.get("emailDigest") === "on"
    // const weeklyReports = formData.get("weeklyReports") === "on"

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        theme: theme as "LIGHT" | "DARK" | "SYSTEM",
        // pushNotifications,
        // emailDigest,
        // weeklyReports,
      },
      select: {
        id: true,
        theme: true,
        // pushNotifications: true,
        // emailDigest: true,
        // weeklyReports: true,
      },
    })

    revalidatePath("/dashboard/settings/preferences")
    return { success: true, preferences: updatedUser }
  } catch (error) {
    console.error("Error updating preferences:", error)
    return { error: "Failed to update preferences" }
  }
}

export async function getUserPreferences() {
  try {
    const user = await requireUser()

    return {
      theme: user.theme,
      // pushNotifications: user.pushNotifications,
      // emailDigest: user.emailDigest,
      // weeklyReports: user.weeklyReports,
    }
  } catch (error) {
    console.error("Error getting user preferences:", error)
    return null
  }
}

export async function deleteAccount() {
  try {
    const user = await requireUser()

    // Delete all user's data
    await prisma.$transaction([
      prisma.decision.deleteMany({ where: { userId: user.id } }),
      prisma.focus.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
      prisma.authProvider.deleteMany({ where: { userId: user.id } })
    ])

    return { success: true }
  } catch (error) {
    console.error("Error deleting account:", error)
    return { error: "Failed to delete account" }
  }
}
