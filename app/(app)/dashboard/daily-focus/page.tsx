import React from "react";
import type { Metadata } from "next";
import DailyFocusPage from "../../../_components/DailyFocus";
import {getTodaysFocus } from "@/actions";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Daily Focus",
  description: "Define your daily priorities, track progress, and stay aligned with what truly matters each day. Manage your focus with intention.",
  keywords: ["daily focus", "daily priorities", "focus tracking", "productivity", "daily goals"],
  canonicalUrl: "/dashboard/daily-focus",
  noIndex: true, // Dashboard pages typically shouldn't be indexed
});

async function page() {
  const { data, error } = await getTodaysFocus();

  return <DailyFocusPage recentFocus={data} />;
}

export default page;
