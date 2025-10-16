import type { Metadata } from "next";
import { AccountForms } from "./AccountForms";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Account Settings",
  description: "Manage your account security and authentication settings.",
  keywords: ["account", "security", "authentication", "password"],
  canonicalUrl: "/dashboard/settings/account",
  noIndex: true,
});

export default function AccountPage() {
  return <AccountForms />;
}
