import { getDashboardStats } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award } from "lucide-react";
import { DashboardCharts } from "./dashboard-charts";
import { StatsGrid } from "./stats-grid";
import { getServerSession } from "next-auth";
import { NoDataFound } from "@/components/custom/NoDataFound";

export async function DashboardServer() {
  const session = await getServerSession();
  const stats = await getDashboardStats();
  
  if (!stats.data) {
    return (
      <NoDataFound
        title="Dashboard Data Unavailable"
        description="We couldn't load your dashboard data. This might be because you're new here or there was a temporary issue."
        redirectOnRetry="/dashboard"
        className="min-h-[60vh]"
      />
    );
  }

  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12
      ? "Good morning"
      : currentTime < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-2xl md:text-4xl font-semibold text-[#37322F] dark:text-white">
              {greeting}, {session?.user?.name}
            </h1>
          </div>
          <p className="text-sm md:text-lg text-[#605A57] dark:text-gray-300">
            Here's your complete overview and insights
          </p>
        </div>
      </div>

      {/* Hero Stats - Streak & Overview */}
      <div className="grid gap-4 md:grid-cols-2 w-auto max-w-full">
        <Card className="border-[#E0DEDB] bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 shadow-md w-auto max-w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-[#605A57] dark:text-orange-200 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                  Current Streak
                </CardTitle>
              </div>
              <Award className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-5xl font-bold text-[#37322F] dark:text-white">
                {stats.data.currentStreak}
              </div>
              <div className="text-lg text-[#605A57] dark:text-gray-300">days</div>
            </div>
            <p className="mt-2 text-sm text-[#605A57] dark:text-gray-400">
              Longest: <span className="font-semibold text-[#37322F] dark:text-white">
                {stats.data.longestStreak}
              </span> days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats.data} />

      {/* Charts */}
      <DashboardCharts stats={stats.data} />
    </div>
  );
}
