"use client";

import { useState, useTransition } from "react";
import { addPassword, changePassword, deleteAccount } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logOut } from "@/lib/user";

interface PasswordChangeFormProps {
  hasPassword: boolean;
}

function PasswordChangeForm({ hasPassword }: PasswordChangeFormProps) {
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = hasPassword
        ? await changePassword(formData)
        : await addPassword(formData);

      if (result?.error) {
        setMessage({ text: result.error, success: false });
      } else if (result?.success) {
        setMessage({
          text: hasPassword
            ? "Password changed successfully!"
            : "Password added successfully!",
          success: true
        });
        // Clear form
        const form = document.getElementById("password-form") as HTMLFormElement;
        if (form) form.reset();

        // Refresh to update the form state if we just added a password
        if (!hasPassword) {
          window.location.reload();
        }
      }
    });
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
      <div className="mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-normal text-foreground">
          {hasPassword ? 'Change Password' : 'Apply Password'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasPassword
            ? 'Update your password to keep your account secure'
            : 'Add a password to enable email/password login for your account'}
        </p>
      </div>
      <form id="password-form" action={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${message.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
            {message.text}
          </div>
        )}

        {hasPassword && <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="Enter current password"
            className="rounded-full h-11"
            required
          />
        </div>}

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="Enter new password"
            className="rounded-full h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            className="rounded-full h-11"
            required
          />
        </div>

        <Button type="submit" className="w-full rounded-full h-11" size="lg" disabled={isPending}>
          {isPending
            ? hasPassword
              ? "Updating..."
              : "Applying..."
            : hasPassword
              ? "Update Password"
              : "Apply Password"}
        </Button>
      </form>
    </div>
  );
}

function DeleteAccountForm() {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      startTransition(async () => {
        const result = await deleteAccount();
        if (result?.success) {
          logOut()
        } else {
          alert("Failed to delete account. Please try again.");
        }
      });
    }
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-2xl border-2 border-destructive/30 shadow-sm">
      <div className="mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-normal text-destructive">Danger Zone</h2>
        <p className="mt-2 text-sm text-muted-foreground">Irreversible actions for your account</p>
      </div>
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>
        <Button
          onClick={handleDelete}
          variant="destructive"
          className="rounded-full h-11"
          size="lg"
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete Account"}
        </Button>
      </div>
    </div>
  );
}

export function AccountForms({ user }: { user: { password: string | null } }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 w-full">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground">
          Account Settings
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Manage your account security and authentication
        </p>
      </div>
      <div className="space-y-6">
        <PasswordChangeForm hasPassword={!!user?.password} />
        <DeleteAccountForm />
      </div>
    </div>
  );
}
