import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getArchivedFocusEntries, getArchivedDecisions } from "@/actions/archive"
import FocusTable from "./FocusTable"
import DecisionTable from "./DecisionTable"
import { FocusStatus, DecisionCategory } from "@/lib/generated/prisma"
import { redirect } from "next/navigation"

interface SearchParams {
  // Focus params
  focusPage?: string
  focusSortBy?: string
  focusSortOrder?: string
  focusStatus?: string
  focusSearch?: string
  // Decision params
  decisionPage?: string
  decisionSortBy?: string
  decisionSortOrder?: string
  decisionCategory?: string
  decisionSearch?: string
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // Await searchParams for Next.js 15
  const params = await searchParams

  // Parse Focus parameters
  const focusPage = parseInt(params.focusPage || "1")
  const focusSortBy = params.focusSortBy || "date"
  const focusSortOrder = (params.focusSortOrder || "desc") as "asc" | "desc"
  const focusStatus = params.focusStatus as FocusStatus | undefined
  const focusSearch = params.focusSearch

  // Parse Decision parameters
  const decisionPage = parseInt(params.decisionPage || "1")
  const decisionSortBy = params.decisionSortBy || "date"
  const decisionSortOrder = (params.decisionSortOrder || "desc") as "asc" | "desc"
  const decisionCategory = params.decisionCategory as DecisionCategory | undefined
  const decisionSearch = params.decisionSearch

  // Fetch data with server actions
  const [focusResult, decisionsResult] = await Promise.all([
    getArchivedFocusEntries(
      {
        status: focusStatus,
        search: focusSearch,
      },
      {
        page: focusPage,
        limit: 10,
        sortBy: focusSortBy,
        sortOrder: focusSortOrder,
      }
    ),
    getArchivedDecisions(
      {
        category: decisionCategory,
        search: decisionSearch,
      },
      {
        page: decisionPage,
        limit: 10,
        sortBy: decisionSortBy,
        sortOrder: decisionSortOrder,
      }
    ),
  ])

  // Handle unauthorized
  if (focusResult.error === "Unauthorized" || decisionsResult.error === "Unauthorized") {
    redirect("/login")
  }

  // Handle errors
  if (focusResult.error || decisionsResult.error) {
    return (
      <div className="mx-auto max-w-6xl px-4 p-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error loading archive</h1>
          <p className="mt-2 text-muted-foreground">
            {focusResult.error || decisionsResult.error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 p-6 sm:px-6 lg:px-8">
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
          </CardHeader>
          <CardContent>
            {focusResult.data && focusResult.pagination ? (
              <FocusTable data={focusResult.data} pagination={focusResult.pagination} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No focus entries found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decisions Archive */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-3xl font-normal">Decision History</CardTitle>
          </CardHeader>
          <CardContent>
            {decisionsResult.data && decisionsResult.pagination ? (
              <DecisionTable data={decisionsResult.data} pagination={decisionsResult.pagination} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No decisions found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
