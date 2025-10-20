// components/PDFDocument.tsx
import { ExportData } from '@/actions/export'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
    borderBottom: '2px solid #333333',
    paddingBottom: 5,
  },
  statsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #dee2e6',
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statItem: {
    width: '48%',
    fontSize: 12,
    marginBottom: 8,
  },
  entry: {
    marginBottom: 20,
    padding: 15,
    border: '1px solid #dddddd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  entryTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  entryText: {
    fontSize: 10,
    marginBottom: 4,
    color: '#666666',
  },
})

interface PDFDocumentProps {
  exportData: ExportData
}

export const PDFDocument = ({ exportData }: PDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>OneDot - Export</Text>
        <Text style={styles.subtitle}>Generated: {new Date().toLocaleDateString()}</Text>
      </View>

      {/* Summary Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Summary Statistics</Text>
        <View style={styles.statsGrid}>
          <Text style={styles.statItem}><Text style={{fontWeight: 'bold'}}>Total Focus Entries:</Text> {exportData.stats.totalFocuses}</Text>
          <Text style={styles.statItem}><Text style={{fontWeight: 'bold'}}>Achieved:</Text> {exportData.stats.achievedFocuses}</Text>
          <Text style={styles.statItem}><Text style={{fontWeight: 'bold'}}>Completion Rate:</Text> {exportData.stats.completionRate}%</Text>
          <Text style={styles.statItem}><Text style={{fontWeight: 'bold'}}>Total Decisions:</Text> {exportData.stats.totalDecisions}</Text>
        </View>
      </View>

      {/* Focus Entries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Entries</Text>
        {exportData.focuses.map((focus, index) => (
          <View key={index} style={styles.entry}>
            <Text style={styles.entryTitle}>{focus.title}</Text>
            <Text style={styles.entryText}><Text style={{fontWeight: 'bold'}}>Date:</Text> {focus.date}</Text>
            <Text style={styles.entryText}><Text style={{fontWeight: 'bold'}}>Status:</Text> {focus.status}</Text>
            <Text style={styles.entryText}><Text style={{fontWeight: 'bold'}}>Mood:</Text> {focus.mood}</Text>
            <Text style={styles.entryText}><Text style={{fontWeight: 'bold'}}>Notes:</Text> {focus.notes}</Text>
          </View>
        ))}
      </View>

      {/* Decision Entries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Decision Entries</Text>
        {exportData.decisions.map((decision, index) => (
          <View key={index} style={styles.entry}>
            <Text style={styles.entryTitle}>{decision.title}</Text>
            <Text style={styles.entryText}><Text style={{fontWeight: 'bold'}}>Date:</Text> {decision.date}</Text>
            <Text style={styles.entryText}><Text style={{fontWeight: 'bold'}}>Category:</Text> {decision.category}</Text>
            <Text style={styles.entryText}><Text style={{fontWeight: 'bold'}}>Reason:</Text> {decision.reason}</Text>
          </View>
        ))}
      </View>

      {/* Category Breakdown */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Decision Categories</Text>
        {Object.entries(exportData.stats.categoryCounts).map(([category, count]) => (
          <Text key={category} style={styles.entryText}>
            <Text style={{fontWeight: 'bold'}}>{category}:</Text> {count}
          </Text>
        ))}
      </View>
    </Page>
  </Document>
)