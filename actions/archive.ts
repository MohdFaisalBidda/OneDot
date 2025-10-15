"use server"

import prisma from "@/lib/prismaClient"
import { getCurrentUser } from "./auth"
import { FocusStatus, DecisionCategory, Prisma } from "@/lib/generated/prisma"

export type SortOrder = "asc" | "desc"

export interface FocusFilters {
  status?: FocusStatus
  mood?: string
  search?: string
}

export interface DecisionFilters {
  category?: DecisionCategory
  search?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
}

export const getArchivedFocusEntries = async (
  filters: FocusFilters = {},
  pagination: PaginationParams = {}
) => {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
    } = pagination

    const { status, mood, search } = filters

    // Build where clause
    const where: Prisma.FocusWhereInput = {
      userId: user.id,
      ...(status && { status }),
      ...(mood && { mood: { contains: mood, mode: "insensitive" as Prisma.QueryMode } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          { notes: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        ],
      }),
    }

    // Build orderBy clause
    const orderBy: Prisma.FocusOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    }

    const skip = (page - 1) * limit

    // Execute queries
    const [data, total] = await Promise.all([
      prisma.focus.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.focus.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      status: 200,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  } catch (error) {
    console.error("Error fetching archived focus entries:", error)
    return {
      status: 500,
      error: "Failed to fetch archived focus entries. Please try again.",
    }
  }
}

export const getArchivedDecisions = async (
  filters: DecisionFilters = {},
  pagination: PaginationParams = {}
) => {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
    } = pagination

    const { category, search } = filters

    // Build where clause
    const where: Prisma.DecisionWhereInput = {
      userId: user.id,
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          { reason: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        ],
      }),
    }

    // Build orderBy clause
    const orderBy: Prisma.DecisionOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    }

    const skip = (page - 1) * limit

    // Execute queries
    const [data, total] = await Promise.all([
      prisma.decision.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.decision.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      status: 200,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  } catch (error) {
    console.error("Error fetching archived decisions:", error)
    return {
      status: 500,
      error: "Failed to fetch archived decisions. Please try again.",
    }
  }
}

// Helper function to get available filter options
export const getFocusFilterOptions = async () => {
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const moods = await prisma.focus.findMany({
      where: { userId: user.id },
      select: { mood: true },
      distinct: ["mood"],
    })

    return {
      status: 200,
      data: {
        statuses: Object.values(FocusStatus),
        moods: moods.map((m) => m.mood),
      },
    }
  } catch (error) {
    console.error("Error fetching focus filter options:", error)
    return {
      status: 500,
      error: "Failed to fetch filter options.",
    }
  }
}
