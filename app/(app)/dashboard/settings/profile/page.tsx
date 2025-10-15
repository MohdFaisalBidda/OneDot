import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile } from "@/actions/settings";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  // Get user profile data server-side
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/signin");
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-normal">
            Profile Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your personal details and preferences
          </p>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}