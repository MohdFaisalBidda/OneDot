"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  GitBranch,
  BarChart3,
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { homeDashboardQuickLinks } from "@/consts/routesData";
import { announcements } from "@/consts/dashboard";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/actions/dashboard";
import type { DashboardStats } from "@/actions/dashboard";

function page() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      const result = await getDashboardStats();
      if (result.data) {
        setStats(result.data);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12
      ? "Good morning"
      : currentTime < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          {greeting}, {session?.user?.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          Here's your overview for today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Focus
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-foreground">
              {loading ? "Loading..." : stats?.todaysFocus || "No focus set today"}
            </div>
            <p className="mt-1 flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {stats?.todaysFocus ? "Set today" : "Add a focus for today"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Decisions
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-foreground">
              {loading ? "..." : stats?.recentDecisionsCount ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Made this week</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-foreground">
              {loading ? "..." : `${stats?.focusCompletionRate ?? 0}%`}
            </div>
            <p className={`mt-1 flex items-center text-xs ${
              (stats?.weeklyTrend ?? 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {(stats?.weeklyTrend ?? 0) >= 0 ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              {loading ? "..." : `${Math.abs(stats?.weeklyTrend ?? 0)}% from last week`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Recent Updates
        </h2>
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <Card
              key={index}
              className="border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {announcement.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {announcement.description}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {announcement.date}
                  </span>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Quick Access
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {homeDashboardQuickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="border-border bg-card shadow-sm transition-all hover:scale-105 hover:shadow-md">
                  <CardHeader className="space-y-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg bg-accent ${link.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold text-foreground">
                        {link.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {link.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Preview */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl font-semibold text-foreground">
            Recent Activity
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Your latest journal entries and decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-4">Loading activities...</div>
          ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.slice(0, 2).map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 rounded-lg border border-border p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  activity.type === 'focus' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'focus' ? (
                    <BookOpen className="h-5 w-5" />
                  ) : (
                    <GitBranch className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.type === 'focus' ? 'Daily Focus' : 'Decision Made'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.title} • {new Date(activity.timestamp).toLocaleDateString()}
                    {activity.status && ` • ${activity.status}`}
                    {activity.category && ` • ${activity.category}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No recent activity. Start by adding a focus or decision!
            </div>
          )}

          <div className="pt-2">
            <Link href="/dashboard/archive">
              <Button
                variant="outline"
                className="w-full rounded-full bg-transparent"
              >
                View Complete Archive
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
