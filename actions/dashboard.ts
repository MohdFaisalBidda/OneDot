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
  totalFocusEntries: number
  totalDecisions: number
  currentStreak: number
  longestStreak: number
  categoryBreakdown: Array<{
    category: string
    count: number
  }>
  moodDistribution: Array<{
    mood: string
    count: number
  }>
  weeklyActivity: Array<{
    date: string
    focusCount: number
    decisionCount: number
  }>
  monthlyCompletion: number
  achievedThisWeek: number
  pendingFocuses: number
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
        createdAt: { gte: startOfToday }
      },
      orderBy: { createdAt: 'desc' },
      select: { title: true }
    })

    // Get recent decisions count from this week
    const recentDecisionsCount = await prisma.decision.count({
      where: {
        userId: user.id,
        createdAt: { gte: startOfWeek }
      }
    })

    // Calculate focus completion rate (last 30 days)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const [totalFocuses, achievedFocuses] = await Promise.all([
      prisma.focus.count({
        where: {
          userId: user.id,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          createdAt: { gte: thirtyDaysAgo },
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
          createdAt: { gte: startOfWeek },
          status: FocusStatus.ACHIEVED
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfLastWeek, lt: startOfWeek },
          status: FocusStatus.ACHIEVED
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfWeek }
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfLastWeek, lt: startOfWeek }
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
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true
        }
      }),
      prisma.decision.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
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
        timestamp: f.createdAt,
        status: f.status
      })),
      ...recentDecisions.map(d => ({
        id: d.id,
        type: 'decision' as const,
        title: d.title,
        timestamp: d.createdAt,
        category: d.category
      }))
    ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5)

    // Calculate total entries
    const totalFocusEntries = await prisma.focus.count({
      where: { userId: user.id }
    })

    const totalDecisions = await prisma.decision.count({
      where: { userId: user.id }
    })

    // Calculate streaks (consecutive days with at least one entry)
    const allFocuses = await prisma.focus.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    })

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    const uniqueDates = [...new Set(allFocuses.map(f => f.createdAt.toDateString()))]
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i])
      
      if (i === 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        
        if (currentDate.toDateString() === today.toDateString() || 
            currentDate.toDateString() === yesterday.toDateString()) {
          currentStreak = 1
          tempStreak = 1
        }
      } else {
        const prevDate = new Date(uniqueDates[i - 1])
        const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          tempStreak++
          if (i === 1 || (i > 1 && currentStreak > 0)) {
            currentStreak = tempStreak
          }
        } else {
          tempStreak = 1
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    // Category breakdown for decisions
    const decisions = await prisma.decision.groupBy({
      by: ['category'],
      where: { userId: user.id },
      _count: { category: true }
    })

    const categoryBreakdown = decisions.map(d => ({
      category: d.category,
      count: d._count.category
    }))

    // Mood distribution
    const moods = await prisma.focus.groupBy({
      by: ['mood'],
      where: { userId: user.id },
      _count: { mood: true }
    })

    const moodDistribution = moods.map(m => ({
      mood: m.mood,
      count: m._count.mood
    }))

    // Weekly activity (last 7 days)
    const weeklyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const [focusCount, decisionCount] = await Promise.all([
        prisma.focus.count({
          where: {
            userId: user.id,
            createdAt: { gte: date, lt: nextDate }
          }
        }),
        prisma.decision.count({
          where: {
            userId: user.id,
            createdAt: { gte: date, lt: nextDate }
          }
        })
      ])

      weeklyActivity.push({
        date: date.toISOString().split('T')[0],
        focusCount,
        decisionCount
      })
    }

    // Monthly completion rate
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const [monthlyTotal, monthlyAchieved] = await Promise.all([
      prisma.focus.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.focus.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfMonth },
          status: FocusStatus.ACHIEVED
        }
      })
    ])

    const monthlyCompletion = monthlyTotal > 0 
      ? Math.round((monthlyAchieved / monthlyTotal) * 100) 
      : 0

    // Pending focuses
    const pendingFocuses = await prisma.focus.count({
      where: {
        userId: user.id,
        status: FocusStatus.PENDING
      }
    })

    return {
      data: {
        todaysFocus: todaysFocus?.title || null,
        recentDecisionsCount,
        focusCompletionRate,
        weeklyTrend,
        recentActivities,
        totalFocusEntries,
        totalDecisions,
        currentStreak,
        longestStreak,
        categoryBreakdown,
        moodDistribution,
        weeklyActivity,
        monthlyCompletion,
        achievedThisWeek: thisWeekAchieved,
        pendingFocuses
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      error: "Failed to fetch dashboard statistics. Please try again."
    }
  }
}
