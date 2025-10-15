"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getExportData } from "@/actions/export"
import type { ExportData } from "@/actions/export"
import { toast } from "sonner"
import { CSVLink } from "react-csv"
import { usePDF } from "react-to-pdf"

export default function ExportPage() {
  const [exportData, setExportData] = useState<ExportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingCSV, setExportingCSV] = useState(false)
  const csvLinkRef = useRef<any>(null)
  
  const { toPDF, targetRef } = usePDF({
    filename: `clarity-log-report-${new Date().toISOString().split('T')[0]}.pdf`
  })

  useEffect(() => {
    const fetchData = async () => {
      const result = await getExportData()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setExportData(result.data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleExportCSV = () => {
    if (!exportData) {
      toast.error("No data available to export.")
      return
    }
    setExportingCSV(true)
    setTimeout(() => {
      csvLinkRef.current?.link?.click()
      toast.success("CSV file downloaded successfully!")
      setExportingCSV(false)
    }, 100)
  }

  const handleExportPDF = async () => {
    if (!exportData) {
      toast.error("No data available to export.")
      return
    }
    
    try {
      await toPDF()
      toast.success("PDF report downloaded successfully!")
    } catch (error) {
      console.error("PDF export error:", error)
      toast.error("Failed to generate PDF. Please try again.")
    }
  }

  // Prepare CSV data
  const csvData = exportData ? [
    ...exportData.focuses.map(f => ({
      Type: 'Focus',
      Date: f.date,
      Title: f.title,
      'Status/Category': f.status,
      Mood: f.mood,
      'Notes/Reason': f.notes
    })),
    ...exportData.decisions.map(d => ({
      Type: 'Decision',
      Date: d.date,
      Title: d.title,
      'Status/Category': d.category,
      Mood: '',
      'Notes/Reason': d.reason
    }))
  ] : []

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
                  <Button 
                    onClick={handleExportCSV} 
                    className="rounded-full" 
                    size="lg"
                    disabled={exportingCSV || loading}
                  >
                    {exportingCSV ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {exportingCSV ? "Exporting..." : loading ? "Loading..." : "Export CSV"}
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
                  <Button 
                    onClick={handleExportPDF} 
                    variant="outline" 
                    className="rounded-full bg-transparent" 
                    size="lg"
                    disabled={loading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "Loading..." : "Export PDF"}
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

      {/* Hidden CSV Link */}
      <CSVLink
        data={csvData}
        filename={`clarity-log-export-${new Date().toISOString().split('T')[0]}.csv`}
        ref={csvLinkRef}
        style={{ display: 'none' }}
      />

      {/* Hidden PDF Content */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <div ref={targetRef} style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>Clarity Log - Journal Export</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Generated: {new Date().toLocaleDateString()}</p>
          
          {exportData && (
            <>
              {/* Summary Statistics */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Summary Statistics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong>Total Focus Entries:</strong> {exportData.stats.totalFocuses}
                  </div>
                  <div>
                    <strong>Achieved:</strong> {exportData.stats.achievedFocuses}
                  </div>
                  <div>
                    <strong>Completion Rate:</strong> {exportData.stats.completionRate}%
                  </div>
                  <div>
                    <strong>Total Decisions:</strong> {exportData.stats.totalDecisions}
                  </div>
                </div>
              </div>

              {/* Focus Entries */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #333', paddingBottom: '5px' }}>Focus Entries</h2>
                {exportData.focuses.map((focus, idx) => (
                  <div key={idx} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{focus.title}</h3>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <p><strong>Date:</strong> {focus.date}</p>
                      <p><strong>Status:</strong> {focus.status}</p>
                      <p><strong>Mood:</strong> {focus.mood}</p>
                      <p><strong>Notes:</strong> {focus.notes}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decision Entries */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #333', paddingBottom: '5px' }}>Decision Entries</h2>
                {exportData.decisions.map((decision, idx) => (
                  <div key={idx} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{decision.title}</h3>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <p><strong>Date:</strong> {decision.date}</p>
                      <p><strong>Category:</strong> {decision.category}</p>
                      <p><strong>Reason:</strong> {decision.reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Breakdown */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Decision Categories</h2>
                {Object.entries(exportData.stats.categoryCounts).map(([category, count]) => (
                  <div key={category} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    <strong>{category}:</strong> {count}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
