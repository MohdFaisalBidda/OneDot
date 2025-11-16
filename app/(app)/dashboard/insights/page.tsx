import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { InsightsPage } from "@/app/_components/insights";
import { getAllDecisions, getAllFocus } from "@/actions";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Insights",
  description: "Insights page provides insights about your focus, decisions, and documents.",
  keywords: ["insights", "focus", "decisions", "documents", "analytics", "patterns"],
  canonicalUrl: "/dashboard/insights",
  noIndex: true,
});

export default async function page() {
  const focusEntries = await getAllFocus();
  const decisionEntries = await getAllDecisions();

  return (
    <InsightsPage focusEntries={focusEntries.data} decisionEntries={decisionEntries.data} docEntries={[]}/>
  )
}
