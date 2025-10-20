"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { getExportData } from "@/actions/export"
import type { ExportData } from "@/actions/export"
import { toast } from "sonner"
import { CSVLink } from "react-csv"
import { usePDF } from "react-to-pdf"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { PDFDocument } from "@/components/custom/PDFDocument"
import { pdf } from "@react-pdf/renderer"

export default function ExportPage() {
  const [exportData, setExportData] = useState<ExportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingCSV, setExportingCSV] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [mounted, setMounted] = useState(false)
  const csvLinkRef = useRef<any>(null)
  
  const { toPDF, targetRef } = usePDF({
    filename: `one-dot-report-${new Date().toISOString().split('T')[0]}.pdf`,
    method: 'save',
    page: {
      margin: 10,
      format: 'A4',
    },
  })

  useEffect(() => {
    setMounted(true)
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
    
    setExportingPDF(true)
    try {
      const blob = await pdf(<PDFDocument exportData={exportData} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `one-dot-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("PDF export error:", error)
      toast.error("Failed to generate PDF. Please try again.")
    } finally {
      setExportingPDF(false)
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
    <div className="mx-auto max-w-3xl px-4 pb-4 md:p-6 sm:px-6 lg:px-8">
      <div className="mb-6 md:mb-12 text-center">
        <h1 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          Export Your Data
        </h1>
        <p className="mt-2 md:mt-4 text-sm md:text-lg text-muted-foreground leading-relaxed">Download your journal entries and insights</p>
      </div>

      <div className="space-y-4 md:space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Export to CSV</h3>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Download your data in CSV format for use in spreadsheets and data analysis tools.
                    </p>
                  </div>
                  <Button 
                    onClick={handleExportCSV} 
                    className="rounded-full cursor-pointer w-full sm:w-auto" 
                    size="default"
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

              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Export to PDF</h3>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Generate a beautifully formatted PDF report with your journal entries and visualizations.
                    </p>
                  </div>
                  <Button 
                    onClick={handleExportPDF} 
                    variant="outline" 
                    className="rounded-full bg-transparent cursor-pointer w-full sm:w-auto" 
                    size="default"
                    disabled={loading || exportingPDF}
                  >
                    {exportingPDF ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {exportingPDF ? "Generating..." : loading ? "Loading..." : "Export PDF"}
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
        filename={`one-dot-export-${new Date().toISOString().split('T')[0]}.csv`}
        ref={csvLinkRef}
        style={{ display: 'none' }}
      />

      {/* Hidden PDF Content - Rendered via Portal to isolate from app CSS */}
      {mounted && createPortal(
        <div id="pdf-content" style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: 0, 
          width: '210mm', 
          height: '297mm',
          overflow: 'visible',
          pointerEvents: 'none',
          backgroundColor: '#ffffff',
          isolation: 'isolate'
        }}>
          <div ref={targetRef} style={{ 
          padding: '40px', 
          fontFamily: 'Arial, Helvetica, sans-serif', 
          backgroundColor: '#ffffff', 
          minHeight: '100%',
          width: '100%',
          color: '#000000',
          boxSizing: 'border-box',
          lineHeight: '1.5'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center', color: '#000000' }}>OneDot - Export</h1>
          <p style={{ textAlign: 'center', color: '#666666', marginBottom: '30px' }}>Generated: {new Date().toLocaleDateString()}</p>
          
          {exportData && (
            <>
              {/* Summary Statistics */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #dddddd' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#000000' }}>Summary Statistics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ color: '#000000' }}>
                    <strong>Total Focus Entries:</strong> {exportData.stats.totalFocuses}
                  </div>
                  <div style={{ color: '#000000' }}>
                    <strong>Achieved:</strong> {exportData.stats.achievedFocuses}
                  </div>
                  <div style={{ color: '#000000' }}>
                    <strong>Completion Rate:</strong> {exportData.stats.completionRate}%
                  </div>
                  <div style={{ color: '#000000' }}>
                    <strong>Total Decisions:</strong> {exportData.stats.totalDecisions}
                  </div>
                </div>
              </div>

              {/* Focus Entries */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #333333', paddingBottom: '5px', color: '#000000' }}>Focus Entries</h2>
                {exportData.focuses.map((focus, idx) => (
                  <div key={idx} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #dddddd', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#000000' }}>{focus.title}</h3>
                    <div style={{ fontSize: '14px', color: '#666666' }}>
                      <p><strong style={{ color: '#000000' }}>Date:</strong> {focus.date}</p>
                      <p><strong style={{ color: '#000000' }}>Status:</strong> {focus.status}</p>
                      <p><strong style={{ color: '#000000' }}>Mood:</strong> {focus.mood}</p>
                      <p><strong style={{ color: '#000000' }}>Notes:</strong> {focus.notes}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decision Entries */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '20px', marginBottom: '15px', borderBottom: '2px solid #333333', paddingBottom: '5px', color: '#000000' }}>Decision Entries</h2>
                {exportData.decisions.map((decision, idx) => (
                  <div key={idx} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #dddddd', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#000000' }}>{decision.title}</h3>
                    <div style={{ fontSize: '14px', color: '#666666' }}>
                      <p><strong style={{ color: '#000000' }}>Date:</strong> {decision.date}</p>
                      <p><strong style={{ color: '#000000' }}>Category:</strong> {decision.category}</p>
                      <p><strong style={{ color: '#000000' }}>Reason:</strong> {decision.reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Breakdown */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #dddddd' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#000000' }}>Decision Categories</h2>
                {Object.entries(exportData.stats.categoryCounts).map(([category, count]) => (
                  <div key={category} style={{ marginBottom: '8px', fontSize: '14px', color: '#000000' }}>
                    <strong>{category}:</strong> {count}
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
