"use client";

import { useState, useTransition } from "react";
import { changePassword, deleteAccount } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PasswordChangeForm() {
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await changePassword(formData);
      if (result?.error) {
        setMessage({ text: result.error, success: false });
      } else if (result?.success) {
        setMessage({ text: "Password changed successfully!", success: true });
        // Clear form
        const form = document.getElementById("password-form") as HTMLFormElement;
        if (form) form.reset();
      }
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-2xl font-normal">Change Password</CardTitle>
        <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
      </CardHeader>
      <CardContent>
        <form id="password-form" action={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-lg ${message.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              className="rounded-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              className="rounded-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className="rounded-full"
              required
            />
          </div>

          <Button type="submit" className="w-full rounded-full" size="lg" disabled={isPending}>
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteAccountForm() {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      startTransition(async () => {
        const result = await deleteAccount();
        if (result?.success) {
          // Redirect to home page or show success message
          window.location.href = "/";
        } else {
          alert("Failed to delete account. Please try again.");
        }
      });
    }
  };

  return (
    <Card className="border-destructive shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-2xl font-normal text-destructive">Danger Zone</CardTitle>
        <p className="text-sm text-muted-foreground">Irreversible actions for your account</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </p>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="rounded-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountForms() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <PasswordChangeForm />
      <DeleteAccountForm />
    </div>
  );
}
