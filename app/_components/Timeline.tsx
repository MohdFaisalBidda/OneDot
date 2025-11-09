"use client"

import { ReusableModal } from "@/components/custom/reusable-modal"
import { Decision, Focus } from "@/lib/generated/prisma"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useState } from "react"
import { EditDecisionForm } from "./forms/edit-decision-form"
import { EditFocusForm } from "./forms/edit-focus-form"

export function Timeline({
  focusEntries,
  decisionEntries,
}: {
  focusEntries: Focus[] | undefined
  decisionEntries: Decision[] | undefined
}) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null)
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(null)

  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const timelineDays = viewMode === "week" ? getWeekDays() : getMonthDays()

  const getEntriesForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return [
      ...(focusEntries?.filter((e) => new Date(e.createdAt).toDateString() === dateStr) || []),
      ...(decisionEntries?.filter((e) => new Date(e.createdAt).toDateString() === dateStr) || [])
    ]
  }

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDayName = (date: Date) => {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return names[date.getDay()]
  }

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()
  
  // Format date in a consistent way to avoid hydration mismatches
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <>
      <div className="max-w-8xl px-4 pb-4 sm:px-6 lg:px-12 md:p-6 space-y-8">
        <div>
          <h3 className="text-3xl font-serif font-bold text-foreground mb-2">Timeline</h3>
          <p className="text-muted-foreground">Your Focus and Decision evolution</p>
        </div>

        {/* View Mode Toggle and Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-md transition-smooth font-medium ${viewMode === "week" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted/50"
                }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-md transition-smooth font-medium ${viewMode === "month" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted/50"
                }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={goToPrevious} className="p-2 hover:bg-muted rounded-lg transition-smooth">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h4 className="font-serif font-bold text-foreground min-w-fit flex items-center gap-2">
              <Calendar className="w-5 h-5 text-chart-1" />
              {viewMode === "week"
                ? `Week of ${formatDate(timelineDays[0])}`
                : `${formatDate(currentDate)}`}
            </h4>
            <button onClick={goToNext} className="p-2 hover:bg-muted rounded-lg transition-smooth">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Timeline Grid */}
        <div
          className={`grid gap-4 ${viewMode === "week" ? "grid-cols-1 sm:grid-cols-7" : "grid-cols-1 sm:grid-cols-7"}`}
        >
          {timelineDays.map((day) => {
            const entries = getEntriesForDate(day)
            const today = isToday(day)
            const entryCount = entries.length

            return (
              <div
                key={day.toISOString()}
                className={`rounded-lg border transition-smooth ${today
                  ? "bg-primary/10 border-primary shadow-lg"
                  : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                  }`}
              >
                {/* Day Header */}
                <div className={`p-3 border-b border-border/50 ${today ? "bg-primary/5" : ""}`}>
                  <div className="text-xs font-semibold text-muted-foreground">{getDayName(day)}</div>
                  <div className={`text-lg font-bold ${today ? "text-primary" : "text-foreground"}`}>{day.getDate()}</div>
                </div>

                {/* Entries */}
                <div className="p-3 space-y-2 min-h-24">
                  {entryCount === 0 ? (
                    <p className="text-xs text-muted-foreground">—</p>
                  ) : (
                    entries.map((entry) => {
                      console.log(entries,"entries");
                      
                      // More reliable way to distinguish between Focus and Decision
                      const isFocusEntry = 'mood' in entry && !('reason' in entry);
                      const isDecisionEntry = 'reason' in entry && 'category' in entry;

                      return (
                        <div
                          key={entry.id}
                          onClick={() => {
                            if (isFocusEntry) {
                              setSelectedFocus(entry as Focus);
                              setSelectedDecision(null);
                            } else if (isDecisionEntry) {
                              setSelectedDecision(entry as Decision);
                              setSelectedFocus(null);
                            }
                          }}
                          className={`text-xs p-2 rounded-md truncate font-medium transition-smooth hover:shadow-sm cursor-pointer ${
                            isFocusEntry 
                              ? "bg-chart-1/20 text-chart-1 hover:bg-chart-1/30"
                              : "bg-chart-2/20 text-chart-2 hover:bg-chart-2/30"
                          }`}
                          title={entry.title}
                        >
                          {isFocusEntry ? "📌" : "⚡"} {entry.title}
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Entry Count Indicator */}
                {entryCount > 0 && (
                  <div
                    className={`px-3 py-2 text-center border-t border-border/50 text-xs font-medium ${today ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {entryCount} {entryCount === 1 ? "entry" : "entries"}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Focus Items</p>
            <p className="text-2xl font-bold text-chart-1">{focusEntries?.length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Decisions</p>
            <p className="text-2xl font-bold text-chart-2">{decisionEntries?.length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">This Period</p>
            <p className="text-2xl font-bold text-foreground">
              {timelineDays.reduce((sum, day) => sum + getEntriesForDate(day).length, 0)}
            </p>
          </div>
        </div>
      </div>
      <ReusableModal
        open={!!selectedDecision}
        onOpenChange={() => setSelectedDecision(null)}
        title={selectedDecision ? 'View Decision' : ''}
      >
        <EditDecisionForm 
          decision={selectedDecision!} 
          onSuccess={() => setSelectedDecision(null)} 
          onCancel={() => setSelectedDecision(null)}
          viewOnly={true}
        />
      </ReusableModal>

      <ReusableModal
        open={!!selectedFocus}
        onOpenChange={() => setSelectedFocus(null)}
        title={selectedFocus ? 'View Focus' : ''}
      >
        <EditFocusForm 
          focus={selectedFocus!} 
          onSuccess={() => setSelectedFocus(null)} 
          onCancel={() => setSelectedFocus(null)}
          viewOnly={true}
        />
      </ReusableModal>
    </>
  )
}
