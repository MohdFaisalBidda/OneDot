"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({ profile }: { profile: any }) {
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setMessage({ text: result.error, success: false });
      } else if (result?.success) {
        setMessage({ text: "Profile updated successfully!", success: true });
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
      {message && (
        <div className={`p-4 rounded-lg ${message.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={profile.name || ""}
          placeholder="Enter your name"
          className="rounded-full h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={profile.email}
          className="rounded-full h-11 bg-muted cursor-not-allowed"
          disabled
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed here. Contact support if needed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio || ""}
          placeholder="Tell us about yourself"
          rows={4}
          className="rounded-2xl resize-none"
        />
      </div>

      <Button type="submit" className="w-full rounded-full h-11" size="lg" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
