"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ArrowUpDown, Search, X } from "lucide-react"
import { FocusStatus } from "@/lib/generated/prisma"
import { format } from "date-fns"
import { getStatusBadgeStyle, getStatusText } from "@/lib/status-colors"

interface Focus {
  id: string
  title: string
  status: FocusStatus
  mood: string
  notes: string
  image: string | null
  date: Date
}

interface FocusTableProps {
  data: Focus[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function FocusTable({ data, pagination }: FocusTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("focusSearch") || "")

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("focusSearch") || ""
      if (searchTerm !== currentSearch) {
        updateParams({
          focusSearch: searchTerm || null,
          focusPage: "1",
        })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleSort = (field: string) => {
    const currentSort = searchParams.get("focusSortBy")
    const currentOrder = searchParams.get("focusSortOrder") || "desc"
    
    if (currentSort === field) {
      updateParams({
        focusSortBy: field,
        focusSortOrder: currentOrder === "asc" ? "desc" : "asc",
      })
    } else {
      updateParams({
        focusSortBy: field,
        focusSortOrder: "desc",
      })
    }
  }

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const handlePageChange = (newPage: number) => {
    updateParams({ focusPage: newPage.toString() })
  }

  const handleStatusFilter = (status: string) => {
    updateParams({
      focusStatus: status === "all" ? null : status,
      focusPage: "1",
    })
  }

  const currentStatus = searchParams.get("focusStatus") || "all"

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search focus entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select value={currentStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(FocusStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusText(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border max-w-xs sm:max-w-2xl md:max-w-full w-auto">
        <table className="w-full min-w-[200px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-2 md:p-3 text-left text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="p-2 md:p-3 text-left text-xs md:text-sm font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Today's Focus
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="p-2 md:p-3 text-left text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="p-2 md:p-3 text-left text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                <button
                  onClick={() => handleSort("mood")}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  Mood
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="p-2 md:p-3 text-left text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                Notes
              </th>
              <th className="p-2 md:p-3 text-left text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                Image
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No focus entries found
                </td>
              </tr>
            ) : (
              data.map((entry) => (
                <tr key={entry.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="p-2 md:p-3 text-xs md:text-sm whitespace-nowrap">
                    {format(new Date(entry.date), "MMM dd, yyyy")}
                  </td>
                  <td className="p-2 md:p-3 text-xs md:text-sm font-medium max-w-[150px] truncate">
                    {entry.title}
                  </td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] md:text-xs ${getStatusBadgeStyle(entry.status)}`}>
                      {getStatusText(entry.status)}
                    </span>
                  </td>
                  <td className="p-2 md:p-3 text-xs md:text-sm whitespace-nowrap">
                    {entry.mood}
                  </td>
                  <td className="p-2 md:p-3 text-xs md:text-sm text-muted-foreground max-w-[150px] truncate">
                    {entry.notes || "—"}
                  </td>
                  <td className="p-2 md:p-3">
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt="Entry"
                        className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover shadow-sm"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs md:text-sm text-muted-foreground">
          Showing {data.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className="rounded-full"
          >
            <ChevronLeft className="mr-1 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="rounded-full"
          >
            <span className="sm:hidden">Next</span>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}