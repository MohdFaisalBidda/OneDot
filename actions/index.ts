"use server"

import { FocusEntry } from "@/app/_components/DailyFocus";
import { CreateFocusSchema } from "@/app/validations/daily-focus";
import prisma from "@/lib/prismaClient";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { DecisionEntry } from "@/app/_components/DecisionTracker";
import { CreateDecisionSchema } from "@/app/validations/decision-tracker";

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

        const focusEntry = await prisma.focus.create({
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
            id: focusEntry.id,
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


export const CreateDecision = async (data: DecisionEntry) => {
    try {
        const { data: resData, error } = CreateDecisionSchema.safeParse(data);
        console.log(data,"data in decision");
        

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

        const { title, reason, category, image } = resData

        const decision = await prisma.decision.create({
            data: {
                userId: user?.id,
                title: title,
                category,
                reason: reason,
                image,
            },
        })

        revalidatePath("/decisions");

        return {
            success: true,
            id: decision.id,
        }
    } catch (error) {
        console.error("Error creating decision:", error);
        return {
            error: "Failed to create decision entry. Please try again."
        };
    }
}

export const getRecentDecisions = async () => {
 const user = await getCurrentUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    try {
        const recentDecision = await prisma.decision.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                date: "asc",
            },
            take: 3,
        })

        return {
            status: 200,
            data: recentDecision
        }
    } catch (error) {
        console.log("Error getting recent decision:", error);
        return {
            status: 500,
            error: "Failed to fetch recent decision entries. Please try again."
        };
    }
}

export const UpdateDecisionImage = async (decisionId: string, imageUrl: string) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { error: "Unauthorized" };
        }

        await prisma.decision.update({
            where: {
                id: decisionId,
                userId: user.id,
            },
            data: {
                image: imageUrl,
            },
        });

        revalidatePath("/decisions");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error updating decision image:", error);
        return {
            error: "Failed to update decision image. Please try again.",
        };
    }
};

export const UpdateFocusImage = async (focusId: string, imageUrl: string) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { error: "Unauthorized" };
        }

        await prisma.focus.update({
            where: {
                id: focusId,
                userId: user.id,
            },
            data: {
                image: imageUrl,
            },
        });

        revalidatePath("/daily-focus");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error updating focus image:", error);
        return {
            error: "Failed to update focus image. Please try again.",
        };
    }
};

export const UpdateDecision = async (decisionId: string, data: Partial<DecisionEntry>) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { error: "Unauthorized" };
        }

        const { data: resData, error } = CreateDecisionSchema.safeParse(data);

        if (error) {
            const fieldErrors: Record<string, string> = {};

            error.issues.forEach(issue => {
                const fieldName = issue.path[0] as string;
                fieldErrors[fieldName] = issue.message;
            });
            return { error: "Validation failed", fieldErrors };
        }

        await prisma.decision.update({
            where: {
                id: decisionId,
                userId: user.id,
            },
            data: {
                title: resData.title,
                reason: resData.reason,
                category: resData.category,
                image: resData.image,
            },
        });

        revalidatePath("/decisions");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error updating decision:", error);
        return {
            error: "Failed to update decision. Please try again.",
        };
    }
};

export const DeleteDecision = async (decisionId: string) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { error: "Unauthorized" };
        }

        await prisma.decision.delete({
            where: {
                id: decisionId,
                userId: user.id,
            },
        });

        revalidatePath("/decisions");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting decision:", error);
        return {
            error: "Failed to delete decision. Please try again.",
        };
    }
};

export const UpdateFocus = async (focusId: string, data: Partial<FocusEntry>) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { error: "Unauthorized" };
        }

        const { data: resData, error } = CreateFocusSchema.safeParse(data);

        if (error) {
            const fieldErrors: Record<string, string> = {};

            error.issues.forEach(issue => {
                const fieldName = issue.path[0] as string;
                fieldErrors[fieldName] = issue.message;
            });
            return { error: "Validation failed", fieldErrors };
        }

        await prisma.focus.update({
            where: {
                id: focusId,
                userId: user.id,
            },
            data: {
                title: resData.focus,
                status: resData.status,
                mood: resData.mood,
                notes: resData.notes ?? "",
                image: resData.image,
            },
        });

        revalidatePath("/daily-focus");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error updating focus:", error);
        return {
            error: "Failed to update focus. Please try again.",
        };
    }
};

export const DeleteFocus = async (focusId: string) => {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { error: "Unauthorized" };
        }

        await prisma.focus.delete({
            where: {
                id: focusId,
                userId: user.id,
            },
        });

        revalidatePath("/daily-focus");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error deleting focus:", error);
        return {
            error: "Failed to delete focus. Please try again.",
        };
    }
};