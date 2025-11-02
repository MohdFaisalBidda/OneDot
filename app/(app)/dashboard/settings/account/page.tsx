import type { Metadata } from "next";
import { getCurrentUser } from "@/actions/auth";
import { AccountForms } from "./AccountForms";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Account Settings",
  description: "Manage your account security and authentication settings.",
  keywords: ["account", "security", "authentication", "password"],
  canonicalUrl: "/dashboard/settings/account",
  noIndex: true,
});

export default async function AccountPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  return <AccountForms user={user} />;
}
