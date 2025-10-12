"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export default function ExportPage() {
  const handleExportCSV = () => {
    // Mock CSV export
    const csvContent = `Date,Type,Title,Details
2025-02-09,Focus,Complete project proposal,Achieved
2025-02-09,Decision,Switched to morning workouts,Health
2025-02-08,Focus,Review team feedback,Partial`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "focus-journal-export.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    // Mock PDF export notification
    alert(
      "PDF export functionality would generate a formatted PDF document with your journal entries and visualizations.",
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 p-6 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          Export Your Data
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">Download your journal entries and insights</p>
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-medium">Export to CSV</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Download your data in CSV format for use in spreadsheets and data analysis tools.
                    </p>
                  </div>
                  <Button onClick={handleExportCSV} className="rounded-full" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-medium">Export to PDF</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      Generate a beautifully formatted PDF report with your journal entries and visualizations.
                    </p>
                  </div>
                  <Button onClick={handleExportPDF} variant="outline" className="rounded-full bg-transparent" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>All daily focus entries with dates, status, mood, and notes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Complete decision timeline with reasons and categories</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Summary statistics and completion rates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Category breakdowns and insights (PDF only)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
