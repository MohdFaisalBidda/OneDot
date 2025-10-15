"use server"

import prisma from "@/lib/prismaClient"
import { getCurrentUser } from "./auth"

export type ExportData = {
  focuses: Array<{
    date: string
    title: string
    status: string
    mood: string
    notes: string
  }>
  decisions: Array<{
    date: string
    title: string
    category: string
    reason: string
  }>
  stats: {
    totalFocuses: number
    achievedFocuses: number
    completionRate: number
    totalDecisions: number
    categoryCounts: Record<string, number>
  }
}

export const getExportData = async (): Promise<{ data?: ExportData, error?: string }> => {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    // Fetch all focus entries
    const focuses = await prisma.focus.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        title: true,
        status: true,
        mood: true,
        notes: true
      }
    })

    // Fetch all decisions
    const decisions = await prisma.decision.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        title: true,
        category: true,
        reason: true
      }
    })

    // Calculate stats
    const totalFocuses = focuses.length
    const achievedFocuses = focuses.filter(f => f.status === 'ACHIEVED').length
    const completionRate = totalFocuses > 0 
      ? Math.round((achievedFocuses / totalFocuses) * 100) 
      : 0

    // Category counts for decisions
    const categoryCounts: Record<string, number> = {}
    decisions.forEach(d => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1
    })

    const exportData: ExportData = {
      focuses: focuses.map(f => ({
        date: f.date.toISOString().split('T')[0],
        title: f.title,
        status: f.status,
        mood: f.mood,
        notes: f.notes
      })),
      decisions: decisions.map(d => ({
        date: d.date.toISOString().split('T')[0],
        title: d.title,
        category: d.category,
        reason: d.reason
      })),
      stats: {
        totalFocuses,
        achievedFocuses,
        completionRate,
        totalDecisions: decisions.length,
        categoryCounts
      }
    }

    return { data: exportData }
  } catch (error) {
    console.error("Error fetching export data:", error)
    return {
      error: "Failed to fetch export data. Please try again."
    }
  }
}
