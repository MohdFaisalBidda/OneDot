import type React from "react";
import type { Metadata } from "next";
import { getUserProfile } from "@/actions/settings";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = generatePageMetadata({
  title: "Profile",
  description: "Update your personal details and profile information.",
  keywords: ["profile", "personal information", "user settings"],
  canonicalUrl: "/dashboard/settings/profile",
  noIndex: true,
});

export default async function ProfilePage() {
  // Get user profile data server-side
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/signin");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 w-full">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground">
          Profile Information
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Update your personal details and preferences
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}