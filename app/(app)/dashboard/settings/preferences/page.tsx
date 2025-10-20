import type { Metadata } from "next";
import { PreferencesContent } from "./PreferencesContent";
import { generatePageMetadata } from "@/lib/metadata";
import { getUserPreferences } from "@/actions/settings";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Preferences",
  description: "Customize your ClarityLog experience. Manage your settings and preferences.",
  keywords: ["preferences", "settings", "customization"],
  canonicalUrl: "/dashboard/settings/preferences",
  noIndex: true,
});

export default async function PreferencesPage() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    return <div>Error loading preferences</div>;
  }

  return <PreferencesContent preferences={preferences} />;
}
