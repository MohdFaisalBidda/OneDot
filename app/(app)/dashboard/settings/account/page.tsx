"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    alert("Password updated successfully!")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion requested")
    }
  }

  return (
      <div className="mx-auto max-w-2xl space-y-6 py-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">Change Password</CardTitle>
            <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="rounded-full"
                />
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

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
              <Button onClick={handleDeleteAccount} variant="destructive" className="rounded-full" size="lg">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

export default AccountPage;
