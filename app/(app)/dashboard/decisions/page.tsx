import type { Metadata } from "next";
import { getRecentDecisions } from "@/actions";
import DecisionsTrackerPage from "@/app/_components/DecisionTracker";
import React from "react";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Decisions",
  description: "Record your decisions with purpose and clarity. Capture choices, reasons, and outcomes to reflect before your next move.",
  keywords: ["decision tracking", "decision journal", "choice recording", "decision making", "reflection"],
  canonicalUrl: "/dashboard/decisions",
  noIndex: true,
});

async function page() {
  const { data, error } = await getRecentDecisions();
  return <DecisionsTrackerPage decisions={data} />;
}

export default page;

