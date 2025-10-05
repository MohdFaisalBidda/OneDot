import { FocusStatus } from "@/lib/generated/prisma";
import z from "zod";

export const CreateFocusSchema = z.object({
  focus: z
    .string()
    .min(1, { message: "Focus is required" })
    .max(100, { message: "Focus must be less than 100 characters" })
    .trim(),
  status: z
    .enum(FocusStatus, {
      error: "Status is required",
    })
    .default(FocusStatus.PENDING),
  mood: z
    .string()
    .min(1, { message: "Mood is required" })
    .max(50, { message: "Mood must be less than 50 characters" })
    .trim(),
  notes: z
    .string()
    .max(500, { message: "Notes must be less than 500 characters" })
    .trim()
    .optional(),
  image: z
    .string()
    .url({ message: "Image must be a valid URL" })
    .max(500, { message: "Image URL is too long" })
    .optional()
    .or(z.literal("")),
});

export type CreateFocusInput = z.infer<typeof CreateFocusSchema>;
