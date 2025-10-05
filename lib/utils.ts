import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getUserInitials = (name: string) => {
  const initials = name.split(" ")
  if(initials.length === 1) return initials[0].charAt(0).toUpperCase()
  return initials[0].charAt(0).toUpperCase() + initials[1]?.charAt(0).toUpperCase()
}