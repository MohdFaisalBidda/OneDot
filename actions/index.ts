"use server"

import { FocusEntry } from "@/app/_components/DailyFocus";
import { CreateFocusSchema } from "@/app/validations/daily-focus";
import prisma from "@/lib/prismaClient";
import { getCurrentUser } from "./auth";
import { FocusStatus } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

export const CreateFocus = async (data: FocusEntry) => {
    try {
        const { data: resData, error } = CreateFocusSchema.safeParse(data);

        if (error) {
            const fieldErrors: Record<string, string> = {}

            error.issues.forEach(issue => {
                const fieldName = issue.path[0] as string
                fieldErrors[fieldName] = issue.message
            })
            return { error: "Validation failed", fieldErrors }
        }

        const user = await getCurrentUser()

        if (!user) {
            return { error: "Unauthorized" }
        }

        const { focus, status, mood, notes, image } = resData

        await prisma.focus.create({
            data: {
                userId: user?.id,
                title: focus,
                status,
                mood,
                notes: notes ?? "",
                image,
            },
        })

        revalidatePath("/daily-focus");

        return {
            success: true,
        }
    } catch (error) {
        console.error("Error creating focus:", error);
        return {
            error: "Failed to create focus entry. Please try again."
        };
    }
}

export const getRecentFocus = async () => {
    const user = await getCurrentUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    try {
        const recentFocus = await prisma.focus.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                date: "desc",
            },
            take: 3,
        })

        return {
            status: 200,
            data: recentFocus
        }
    } catch (error) {
        console.log("Error getting recent focus:", error);
        return {
            status: 500,
            error: "Failed to fetch recent focus entries. Please try again."
        };
    }

}