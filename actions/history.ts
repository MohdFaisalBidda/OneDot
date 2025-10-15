"use server"

import prisma from "@/lib/prismaClient"
import { getCurrentUser } from "./auth"
import { FocusStatus } from "@/lib/generated/prisma"

export interface HistoryData {
  weeklyData: Array<{ day: string; completed: number }>
  monthlyData: Array<{ week: string; completed: number }>
  decisionCategories: Array<{ name: string; value: number; color: string }>
  stats: {
    totalFocusEntries: number
    totalDecisions: number
    currentStreak: number
    weeklyCompletion: number
    monthlyCompletion: number
  }
}

const CHART_COLORS = [
  "#5B8FF9",
  "#5AD8A6", 
  "#F6BD16",
  "#E8684A",
  "#6F5EF9",
];

export const getHistoryData = async (): Promise<{ data?: HistoryData; error?: string }> => {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const now = new Date()

    // Get weekly data (last 7 days)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)

    const weeklyFocuses = await prisma.focus.findMany({
      where: {
        userId: user.id,
        date: { gte: weekStart },
      },
      select: {
        date: true,
        status: true,
      },
    })

    // Create weekly data structure
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weeklyData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const dayName = dayNames[date.getDay()]
      const completed = weeklyFocuses.filter(
        (f) =>
          f.date.toDateString() === date.toDateString() &&
          f.status === FocusStatus.ACHIEVED
      ).length

      weeklyData.push({ day: dayName, completed })
    }

    // Get monthly data (last 4 weeks)
    const monthStart = new Date(now)
    monthStart.setDate(now.getDate() - 27)
    monthStart.setHours(0, 0, 0, 0)

    const monthlyFocuses = await prisma.focus.findMany({
      where: {
        userId: user.id,
        date: { gte: monthStart },
      },
      select: {
        date: true,
        status: true,
      },
    })

    // Create monthly data by weeks
    const monthlyData = []
    for (let week = 1; week <= 4; week++) {
      const weekStartDate = new Date(monthStart)
      weekStartDate.setDate(monthStart.getDate() + (week - 1) * 7)
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)

      const completed = monthlyFocuses.filter(
        (f) =>
          f.date >= weekStartDate &&
          f.date <= weekEndDate &&
          f.status === FocusStatus.ACHIEVED
      ).length

      monthlyData.push({ week: `Week ${week}`, completed })
    }

    // Get decision categories
    const decisions = await prisma.decision.findMany({
      where: { userId: user.id },
      select: { category: true },
    })

    const categoryMap: Record<string, number> = {}
    decisions.forEach((d) => {
      categoryMap[d.category] = (categoryMap[d.category] || 0) + 1
    })

    const decisionCategories = Object.entries(categoryMap).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))

    // Calculate stats
    const allFocuses = await prisma.focus.count({
      where: { userId: user.id },
    })

    const totalDecisions = decisions.length

    // Calculate current streak
    let currentStreak = 0
    let checkDate = new Date(now)
    checkDate.setHours(0, 0, 0, 0)

    while (true) {
      const dayFocus = await prisma.focus.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: checkDate,
            lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000),
          },
          status: FocusStatus.ACHIEVED,
        },
      })

      if (!dayFocus) {
        break
      }

      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }

    // Weekly completion rate
    const weeklyAchieved = weeklyFocuses.filter((f) => f.status === FocusStatus.ACHIEVED).length
    const weeklyTotal = weeklyFocuses.length
    const weeklyCompletion = weeklyTotal > 0 ? Math.round((weeklyAchieved / weeklyTotal) * 100) : 0

    // Monthly completion rate
    const monthlyAchieved = monthlyFocuses.filter((f) => f.status === FocusStatus.ACHIEVED).length
    const monthlyTotal = monthlyFocuses.length
    const monthlyCompletion = monthlyTotal > 0 ? Math.round((monthlyAchieved / monthlyTotal) * 100) : 0

    return {
      data: {
        weeklyData,
        monthlyData,
        decisionCategories,
        stats: {
          totalFocusEntries: allFocuses,
          totalDecisions,
          currentStreak,
          weeklyCompletion,
          monthlyCompletion,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching history data:", error)
    return {
      error: "Failed to fetch history data. Please try again.",
    }
  }
}
