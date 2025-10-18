"use client";

import { useState, useTransition } from "react";
import { updatePreferences, getUserPreferences } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PreferencesForm({ initialPreferences }: { initialPreferences: any }) {
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [theme, setTheme] = useState(initialPreferences?.theme || "LIGHT");
  // const [notifications, setNotifications] = useState(initialPreferences?.pushNotifications || true);
  // const [emailDigest, setEmailDigest] = useState(initialPreferences?.emailDigest || true);
  // const [weeklyReports, setWeeklyReports] = useState(initialPreferences?.weeklyReports || false);

  const handleSubmit = async (formData: FormData) => {
    // Update form data with current state
    formData.set("theme", theme);
    // formData.set("pushNotifications", notifications ? "on" : "off");
    // formData.set("emailDigest", emailDigest ? "on" : "off");
    // formData.set("weeklyReports", weeklyReports ? "on" : "off");

    startTransition(async () => {
      const result = await updatePreferences(formData);
      if (result?.error) {
        setMessage({ text: result.error, success: false });
      } else if (result?.success) {
        setMessage({ text: "Preferences saved successfully!", success: true });
      }
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-serif text-2xl font-normal">Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">Customize your experience</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {message && (
          <div className={`p-4 rounded-lg ${message.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form action={handleSubmit}>
          <div className="space-y-4">
            <h3 className="font-medium">Appearance</h3>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIGHT">Light</SelectItem>
                  <SelectItem value="DARK">Dark</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* <div className="space-y-4">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications about your daily focus</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-digest">Email Digest</Label>
                <p className="text-sm text-muted-foreground">Daily summary of your activities</p>
              </div>
              <Switch
                id="email-digest"
                checked={emailDigest}
                onCheckedChange={setEmailDigest}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly progress reports</p>
              </div>
              <Switch
                id="weekly-reports"
                checked={weeklyReports}
                onCheckedChange={setWeeklyReports}
              />
            </div>
          </div> */}

          <div className="pt-4">
            <Button type="submit" className="w-full rounded-full" size="lg" disabled={isPending}>
              {isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export async function PreferencesContent() {
  const preferences = await getUserPreferences();

  if (!preferences) {
    return <div>Error loading preferences</div>;
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <PreferencesForm initialPreferences={preferences} />
    </div>
  );
}
