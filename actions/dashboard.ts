"use server"

import prisma from "@/lib/prismaClient"
import { getCurrentUser } from "./auth"
import { FocusStatus } from "@/lib/generated/prisma"

export interface DashboardStats {
  todaysFocus: string | null
  recentDecisionsCount: number
  focusCompletionRate: number
  weeklyTrend: number
  recentActivities: Array<{
    id: string
    type: 'focus' | 'decision'
    title: string
    timestamp: Date
    status?: string
    category?: string
  }>
}

export const getDashboardStats = async (): Promise<{ data?: DashboardStats, error?: string }> => {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)
    
    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfWeek.getDate() - 7)

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    // Get today's focus (most recent focus entry from today)
    const todaysFocus = await prisma.focus.findFirst({
      where: {
        userId: user.id,
        date: { gte: startOfToday }
      },
      orderBy: { date: 'desc' },
      select: { title: true }
    })

    // Get recent decisions count from this week
    const recentDecisionsCount = await prisma.decision.count({
      where: {
        userId: user.id,
        date: { gte: startOfWeek }
      }
    })

    // Calculate focus completion rate (last 30 days)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const [totalFocuses, achievedFocuses] = await Promise.all([
      prisma.focus.count({
        where: {
          userId: user.id,
          date: { gte: thirtyDaysAgo }
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          date: { gte: thirtyDaysAgo },
          status: FocusStatus.ACHIEVED
        }
      })
    ])

    const focusCompletionRate = totalFocuses > 0 
      ? Math.round((achievedFocuses / totalFocuses) * 100) 
      : 0

    // Calculate weekly trend (compare this week vs last week)
    const [thisWeekAchieved, lastWeekAchieved, thisWeekTotal, lastWeekTotal] = await Promise.all([
      prisma.focus.count({
        where: {
          userId: user.id,
          date: { gte: startOfWeek },
          status: FocusStatus.ACHIEVED
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          date: { gte: startOfLastWeek, lt: startOfWeek },
          status: FocusStatus.ACHIEVED
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          date: { gte: startOfWeek }
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          date: { gte: startOfLastWeek, lt: startOfWeek }
        }
      })
    ])

    const thisWeekRate = thisWeekTotal > 0 ? (thisWeekAchieved / thisWeekTotal) * 100 : 0
    const lastWeekRate = lastWeekTotal > 0 ? (lastWeekAchieved / lastWeekTotal) * 100 : 0
    const weeklyTrend = Math.round(thisWeekRate - lastWeekRate)

    // Get recent activities (mix of focus and decisions)
    const [recentFocuses, recentDecisions] = await Promise.all([
      prisma.focus.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          date: true,
          status: true
        }
      }),
      prisma.decision.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          date: true,
          category: true
        }
      })
    ])

    // Merge and sort activities
    const recentActivities = [
      ...recentFocuses.map(f => ({
        id: f.id,
        type: 'focus' as const,
        title: f.title,
        timestamp: f.date,
        status: f.status
      })),
      ...recentDecisions.map(d => ({
        id: d.id,
        type: 'decision' as const,
        title: d.title,
        timestamp: d.date,
        category: d.category
      }))
    ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5)

    return {
      data: {
        todaysFocus: todaysFocus?.title || null,
        recentDecisionsCount,
        focusCompletionRate,
        weeklyTrend,
        recentActivities
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      error: "Failed to fetch dashboard statistics. Please try again."
    }
  }
}
