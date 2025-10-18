import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Archive } from "lucide-react"
import Link from "next/link"
import { getHistoryData } from "@/actions/history"
import HistoryCharts from "./HistoryCharts"
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "History & Reflection",
  description: "Review your progress and patterns over time. Analyze your focus entries and decisions with insightful visualizations.",
  keywords: ["history", "reflection", "progress tracking", "analytics", "insights", "patterns"],
  canonicalUrl: "/dashboard/history",
  noIndex: true,
});

export default async function HistoryPage() {
  const result = await getHistoryData()
  
  if (result.error) {
    return (
      <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8 p-6">
        <div className="text-center py-20">
          <p className="text-lg text-destructive">{result.error}</p>
        </div>
      </div>
    )
  }

  const historyData = result.data!
  const hasData = historyData.stats.totalFocusEntries > 0 || historyData.stats.totalDecisions > 0

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8 p-6">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          History & Reflection
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Review your progress and patterns over time
        </p>
        <div className="mt-6">
          <Link href="/dashboard/archive">
            <Button variant="outline" className="rounded-full">
              <Archive className="mr-2 h-4 w-4" />
              View Complete Archive
            </Button>
          </Link>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-6">
            No data available yet. Start tracking your focus and decisions!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/daily-focus">
              <Button>Add Focus</Button>
            </Link>
            <Link href="/dashboard/decisions">
              <Button variant="outline">Add Decision</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <HistoryCharts historyData={historyData} />
          
          <div className="grid gap-6 md:grid-cols-3 mt-8">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Focus Entries</p>
                  <p className="mt-2 font-serif text-4xl font-normal">{historyData.stats.totalFocusEntries}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Decisions</p>
                  <p className="mt-2 font-serif text-4xl font-normal">{historyData.stats.totalDecisions}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="mt-2 font-serif text-4xl font-normal">{historyData.stats.currentStreak} days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
