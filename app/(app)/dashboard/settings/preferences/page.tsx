import type { Metadata } from "next";
import { PreferencesContent } from "./PreferencesContent";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Preferences",
  description: "Customize your ClarityLog experience. Manage your settings and preferences.",
  keywords: ["preferences", "settings", "customization"],
  canonicalUrl: "/dashboard/settings/preferences",
  noIndex: true,
});

export default function PreferencesPage() {
  return <PreferencesContent />;
}
