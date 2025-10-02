"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Sample data - in a real app, this would come from a database
const allFocusEntries = [
  {
    id: 1,
    date: "2025-02-10",
    focus: "Complete project proposal",
    achieved: "Yes",
    mood: "Productive",
    notes: "Great progress today",
    image: "/project-document.png",
  },
  {
    id: 2,
    date: "2025-02-09",
    focus: "Review team feedback",
    achieved: "Yes",
    mood: "Reflective",
    notes: "Valuable insights gained",
  },
  {
    id: 3,
    date: "2025-02-08",
    focus: "Plan next quarter goals",
    achieved: "Partial",
    mood: "Thoughtful",
    notes: "Need more time to finalize",
    image: "/planning-calendar.jpg",
  },
  {
    id: 4,
    date: "2025-02-07",
    focus: "Client presentation",
    achieved: "Yes",
    mood: "Confident",
    notes: "Presentation went well",
  },
  {
    id: 5,
    date: "2025-02-06",
    focus: "Code review session",
    achieved: "Yes",
    mood: "Focused",
    notes: "Found several improvements",
  },
  {
    id: 6,
    date: "2025-02-05",
    focus: "Team brainstorming",
    achieved: "Yes",
    mood: "Energized",
    notes: "Lots of creative ideas",
  },
  {
    id: 7,
    date: "2025-02-04",
    focus: "Documentation update",
    achieved: "No",
    mood: "Distracted",
    notes: "Will revisit tomorrow",
  },
  {
    id: 8,
    date: "2025-02-03",
    focus: "Sprint planning",
    achieved: "Yes",
    mood: "Organized",
    notes: "Clear roadmap established",
  },
]

const allDecisions = [
  {
    id: 1,
    date: "2025-02-10",
    title: "Switch to remote work",
    reason: "Better work-life balance",
    category: "Lifestyle",
    image: "/home-office-setup.png",
  },
  {
    id: 2,
    date: "2025-02-08",
    title: "Start morning meditation",
    reason: "Reduce stress and improve focus",
    category: "Health",
  },
  {
    id: 3,
    date: "2025-02-06",
    title: "Invest in index funds",
    reason: "Long-term financial security",
    category: "Finance",
    image: "/investment-chart.png",
  },
  {
    id: 4,
    date: "2025-02-05",
    title: "Accept new project role",
    reason: "Career growth opportunity",
    category: "Career",
  },
  { id: 5, date: "2025-02-03", title: "Join gym membership", reason: "Improve physical health", category: "Health" },
  {
    id: 6,
    date: "2025-02-01",
    title: "Learn new programming language",
    reason: "Expand technical skills",
    category: "Career",
  },
]

const ITEMS_PER_PAGE = 5

export default function ArchivePage() {
  const [focusPage, setFocusPage] = useState(1)
  const [decisionsPage, setDecisionsPage] = useState(1)

  const totalFocusPages = Math.ceil(allFocusEntries.length / ITEMS_PER_PAGE)
  const totalDecisionsPages = Math.ceil(allDecisions.length / ITEMS_PER_PAGE)

  const paginatedFocusEntries = allFocusEntries.slice((focusPage - 1) * ITEMS_PER_PAGE, focusPage * ITEMS_PER_PAGE)

  const paginatedDecisions = allDecisions.slice((decisionsPage - 1) * ITEMS_PER_PAGE, decisionsPage * ITEMS_PER_PAGE)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          Complete Archive
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          All your daily focus entries and decisions in one place
        </p>
      </div>

      <div className="space-y-12">
        {/* Daily Focus Archive */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-3xl font-normal">Daily Focus Entries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {(focusPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(focusPage * ITEMS_PER_PAGE, allFocusEntries.length)} of {allFocusEntries.length} entries
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Today's Focus</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Achieved</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Mood</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Notes</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFocusEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 last:border-0">
                      <td className="py-4 text-sm">{entry.date}</td>
                      <td className="py-4 text-sm font-medium">{entry.focus}</td>
                      <td className="py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            entry.achieved === "Yes"
                              ? "bg-green-100 text-green-800"
                              : entry.achieved === "Partial"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {entry.achieved}
                        </span>
                      </td>
                      <td className="py-4 text-sm">{entry.mood}</td>
                      <td className="py-4 text-sm text-muted-foreground">{entry.notes}</td>
                      <td className="py-4">
                        {entry.image ? (
                          <img
                            src={entry.image || "/placeholder.svg"}
                            alt="Entry"
                            className="h-12 w-12 rounded-lg object-cover shadow-sm"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFocusPage((p) => Math.max(1, p - 1))}
                disabled={focusPage === 1}
                className="rounded-full"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {focusPage} of {totalFocusPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFocusPage((p) => Math.min(totalFocusPages, p + 1))}
                disabled={focusPage === totalFocusPages}
                className="rounded-full"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Decisions Archive */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-3xl font-normal">Decision History</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {(decisionsPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(decisionsPage * ITEMS_PER_PAGE, allDecisions.length)} of {allDecisions.length} decisions
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Decision</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Reason</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDecisions.map((decision) => (
                    <tr key={decision.id} className="border-b border-border/50 last:border-0">
                      <td className="py-4 text-sm">{decision.date}</td>
                      <td className="py-4 text-sm font-medium">{decision.title}</td>
                      <td className="py-4 text-sm text-muted-foreground">{decision.reason}</td>
                      <td className="py-4 text-sm">
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                          {decision.category}
                        </span>
                      </td>
                      <td className="py-4">
                        {decision.image ? (
                          <img
                            src={decision.image || "/placeholder.svg"}
                            alt="Decision reference"
                            className="h-12 w-12 rounded-lg object-cover shadow-sm"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDecisionsPage((p) => Math.max(1, p - 1))}
                disabled={decisionsPage === 1}
                className="rounded-full"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {decisionsPage} of {totalDecisionsPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDecisionsPage((p) => Math.min(totalDecisionsPages, p + 1))}
                disabled={decisionsPage === totalDecisionsPages}
                className="rounded-full"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
