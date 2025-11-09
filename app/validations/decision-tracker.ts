import { DecisionCategory, DecisionStatus } from "@/lib/generated/prisma";
import z from "zod";


export const CreateDecisionSchema = z.object({
    title: z
        .string()
        .min(1, { message: "Title is required" })
        .max(100, { message: "Title must be less than 100 characters" })
        .trim(),
    reason: z
        .string()
        .min(1, { message: "Reason is required" })
        .max(500, { message: "Reason must be less than 500 characters" })
        .trim(),
    status: z
        .enum(DecisionStatus, {
            error: "Status is required",
        })
        .default(DecisionStatus.PENDING),
    category: z
        .enum(DecisionCategory, {
            error: "Category is required",
        })
        .default(DecisionCategory.CAREER),
    image: z
        .string()
        .url({ message: "Image must be a valid URL" })
        .max(500, { message: "Image URL is too long" })
        .optional()
        .or(z.literal("")),
})

export type CreateDecisionInput = z.infer<typeof CreateDecisionSchema>