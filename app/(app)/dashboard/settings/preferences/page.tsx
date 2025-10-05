"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

function PreferencesPage() {
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)

  const handleSave = () => {
    alert("Preferences saved successfully!")
  }

  return (
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-medium">Appearance</h3>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme" className="rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Notifications</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about your daily focus</p>
                </div>
                <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-digest">Email Digest</Label>
                  <p className="text-sm text-muted-foreground">Daily summary of your activities</p>
                </div>
                <Switch id="email-digest" checked={emailDigest} onCheckedChange={setEmailDigest} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly progress reports</p>
                </div>
                <Switch id="weekly-reports" checked={weeklyReports} onCheckedChange={setWeeklyReports} />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full rounded-full" size="lg">
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}

export default PreferencesPage;
