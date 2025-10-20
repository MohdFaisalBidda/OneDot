"use client";

import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Target,
  Flame,
  Calendar,
  Award,
  PlusCircle,
  Activity,
  Zap,
  TrendingDown,
  Brain,
  Sparkles,
  Crown,
} from "lucide-react";
import SmartInsights from "@/app/_components/SmartInsights";
import { homeDashboardQuickLinks } from "@/consts/routesData";
import { announcements } from "@/consts/dashboard";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/actions/dashboard";
import type { DashboardStats } from "@/actions/dashboard";
import {
  getStatusBadgeStyle,
  getCategoryColor,
  getMoodColor,
  getStatusText
} from "@/lib/status-colors";

function page() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getDashboardStats();
      if (result.data) {
        setStats(result.data);
        setUserData(result.userData);
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
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6 p-4 md:p-6 bg-[#F7F5F3]/30 overflow-x-hidden w-full">
      {/* Welcome Section with Quick Actions */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-2xl md:text-4xl font-semibold text-[#37322F]">
              {greeting}, {session?.user?.name}
            </h1>
            {userData?.isLifetimeFree && (
              <Badge className="bg-[#37322F] text-[#F7F5F3] border border-[#E0DEDB] px-3 py-1 shadow-sm">
                <Crown className="h-3 w-3 mr-1" />
                Lifetime Free #{userData.userNumber}
              </Badge>
            )}
          </div>
          <p className="text-sm md:text-lg text-[#605A57]">
            Here's your complete overview and insights
          </p>
        </div>
        {/* <div className="flex gap-2 w-full md:w-auto">
          <Link href="/dashboard/daily-focus" className="flex-1 md:flex-initial">
            <Button className="bg-[#37322F] hover:bg-[#49423D] text-white rounded-full shadow-sm w-full md:w-auto text-sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Focus
            </Button>
          </Link>
          <Link href="/dashboard/decisions" className="flex-1 md:flex-initial">
            <Button variant="outline" className="rounded-full border-[#E0DEDB] w-full md:w-auto text-sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Decision
            </Button>
          </Link>
        </div> */}
      </div>

      {/* Hero Stats - Streak & Overview */}
      <div className="grid gap-4 md:grid-cols-2 w-auto max-w-full">
        <Card className="border-[#E0DEDB] bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-md w-auto max-w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-[#605A57] flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Current Streak
                </CardTitle>
              </div>
              <Award className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-5xl font-bold text-[#37322F]">
                {loading ? "..." : stats?.currentStreak ?? 0}
              </div>
              <div className="text-lg text-[#605A57]">days</div>
            </div>
            <p className="mt-2 text-sm text-[#605A57]">
              Longest: <span className="font-semibold text-[#37322F]">{loading ? "..." : stats?.longestStreak ?? 0}</span> days
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E0DEDB] bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md w-auto max-w-full">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[#605A57] flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Today's Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-lg font-semibold text-[#37322F] line-clamp-2">
                {loading ? "Loading..." : stats?.todaysFocus || "No focus set today"}
              </div>
              {!stats?.todaysFocus && (
                <Link href="/dashboard/daily-focus">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    Set your focus now
                  </Button>
                </Link>
              )}
              {stats?.todaysFocus && (
                <div className="flex items-center gap-2 text-xs text-[#605A57]">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Focus set for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics - 4 Column Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-auto max-w-full">
        <Card className="border-[#E0DEDB] bg-card shadow-sm hover:shadow-md transition-all w-auto max-w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#605A57]">
              Monthly Progress
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-[#605A57]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#37322F]">
              {loading ? "..." : `${stats?.monthlyCompletion ?? 0}%`}
            </div>
            <Progress value={stats?.monthlyCompletion ?? 0} className="mt-2 h-2" />
            <p className="mt-2 text-xs text-[#605A57]">
              Completion rate this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E0DEDB] bg-card shadow-sm hover:shadow-md transition-all w-auto max-w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#605A57]">
              Total Entries
            </CardTitle>
            <BookOpen className="h-4 w-4 text-[#605A57]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#37322F]">
              {loading ? "..." : stats?.totalFocusEntries ?? 0}
            </div>
            <p className="mt-2 text-xs text-[#605A57]">
              Focus entries logged
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E0DEDB] bg-card shadow-sm hover:shadow-md transition-all w-auto max-w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#605A57]">
              Decisions Made
            </CardTitle>
            <GitBranch className="h-4 w-4 text-[#605A57]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#37322F]">
              {loading ? "..." : stats?.totalDecisions ?? 0}
            </div>
            <p className="mt-2 text-xs text-[#605A57]">
              {stats?.recentDecisionsCount ?? 0} this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E0DEDB] bg-card shadow-sm hover:shadow-md transition-all w-auto max-w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#605A57]">
              Pending Tasks
            </CardTitle>
            <Clock className="h-4 w-4 text-[#605A57]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#37322F]">
              {loading ? "..." : stats?.pendingFocuses ?? 0}
            </div>
            <p className="mt-2 text-xs text-[#605A57]">
              Awaiting completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights - AI Powered Feature */}
      {/* <SmartInsights /> */}

      {/* Analytics Row - Weekly Activity & Insights */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3 w-auto max-w-full">
        {/* Weekly Activity Chart */}
        <Card className="lg:col-span-2 border-[#E0DEDB] bg-card shadow-sm overflow-hidden w-auto max-w-full">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-semibold text-[#37322F] flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Weekly Activity
            </CardTitle>
            <CardDescription className="text-sm text-[#605A57]">
              Your focus and decision entries over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center text-[#605A57]">
                Loading activity data...
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.weeklyActivity?.map((day, index) => (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#605A57] gap-2">
                      <span className="font-medium truncate">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="shrink-0">
                        {day.focusCount + day.decisionCount} {day.focusCount + day.decisionCount === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>
                    <div className="flex gap-1 h-8">
                      {day.focusCount > 0 && (
                        <div
                          className="bg-blue-500 rounded-sm flex items-center justify-center text-xs text-white font-medium hover:bg-blue-600 transition-colors"
                          style={{ width: `${(day.focusCount / Math.max(1, day.focusCount + day.decisionCount)) * 100}%` }}
                          title={`${day.focusCount} focus ${day.focusCount === 1 ? 'entry' : 'entries'}`}
                        >
                          {day.focusCount > 0 && <BookOpen className="h-3 w-3" />}
                        </div>
                      )}
                      {day.decisionCount > 0 && (
                        <div
                          className="bg-purple-500 rounded-sm flex items-center justify-center text-xs text-white font-medium hover:bg-purple-600 transition-colors"
                          style={{ width: `${(day.decisionCount / Math.max(1, day.focusCount + day.decisionCount)) * 100}%` }}
                          title={`${day.decisionCount} decision ${day.decisionCount === 1 ? 'entry' : 'entries'}`}
                        >
                          {day.decisionCount > 0 && <GitBranch className="h-3 w-3" />}
                        </div>
                      )}
                      {day.focusCount === 0 && day.decisionCount === 0 && (
                        <div className="w-full bg-[#E0DEDB] rounded-sm"></div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 pt-2 border-t border-[#E0DEDB]">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-xs text-[#605A57]">Focus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-purple-500 rounded-sm"></div>
                    <span className="text-xs text-[#605A57]">Decisions</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="border-[#E0DEDB] bg-card shadow-sm w-auto max-w-full">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-semibold text-[#37322F] flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Completion Rate Trend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#37322F]">Completion Rate</span>
                <Badge variant={stats?.focusCompletionRate ?? 0 >= 70 ? "default" : "secondary"} className="rounded-full">
                  {loading ? "..." : `${stats?.focusCompletionRate ?? 0}%`}
                </Badge>
              </div>
              <Progress value={stats?.focusCompletionRate ?? 0} className="h-2" />
            </div>

            {/* Weekly Trend */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#37322F]">Weekly Trend</span>
                <div className={`flex items-center gap-1 text-sm font-medium ${(stats?.weeklyTrend ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                  {(stats?.weeklyTrend ?? 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {loading ? "..." : `${Math.abs(stats?.weeklyTrend ?? 0)}%`}
                </div>
              </div>
            </div>

            {/* This Week Achievement */}
            <div className="pt-3 border-t border-[#E0DEDB]">
              <div className="flex items-center gap-2 text-sm text-[#605A57]">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>
                  <span className="font-semibold text-[#37322F]">{loading ? "..." : stats?.achievedThisWeek ?? 0}</span> achieved this week
                </span>
              </div>
            </div>

            {/* Motivation Message */}
            <div className="pt-3 border-t border-[#E0DEDB]">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-xs text-[#605A57] leading-relaxed">
                  {stats?.currentStreak ?? 0 >= 7
                    ? "Amazing! You're on a hot streak! Keep it going!"
                    : stats?.currentStreak ?? 0 >= 3
                      ? "Great momentum! Stay consistent to build your streak."
                      : "Start building your streak by logging daily entries!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category & Mood Breakdown */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 w-auto max-w-full">
        {/* Decision Categories */}
        <Card className="border-[#E0DEDB] bg-card shadow-sm w-auto max-w-full">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-semibold text-[#37322F]">
              Decision Categories
            </CardTitle>
            <CardDescription className="text-sm text-[#605A57]">
              Distribution of your decisions by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-32 flex items-center justify-center text-[#605A57]">
                Loading category data...
              </div>
            ) : stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {stats.categoryBreakdown.slice(0, 5).map((cat, index) => {
                  const total = stats.categoryBreakdown.reduce((sum, c) => sum + c.count, 0);
                  const percentage = Math.round((cat.count / total) * 100);
                  const colorClass = getCategoryColor(cat.category);

                  return (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#37322F]">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#37322F]">{cat.count}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-[#37322F] ${colorClass}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-[#F7F5F3] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-center text-[#605A57]">
                <p>No decisions logged yet.<br />Start tracking your decisions!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card className="border-[#E0DEDB] bg-card shadow-sm w-auto max-w-full">
          <CardHeader>
            <CardTitle className="font-serif text-xl font-semibold text-[#37322F]">
              Mood Tracker
            </CardTitle>
            <CardDescription className="text-sm text-[#605A57]">
              Your emotional patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-32 flex items-center justify-center text-[#605A57]">
                Loading mood data...
              </div>
            ) : stats?.moodDistribution && stats.moodDistribution.length > 0 ? (
              <div className="space-y-3">
                {stats.moodDistribution.slice(0, 5).map((mood, index) => {
                  const total = stats.moodDistribution.reduce((sum, m) => sum + m.count, 0);
                  const percentage = Math.round((mood.count / total) * 100);
                  const colorClass = getMoodColor(mood.mood);

                  return (
                    <div key={mood.mood} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#37322F] capitalize">{mood.mood}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#37322F]">{mood.count}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-[#F7F5F3] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-center text-[#605A57]">
                <p>No mood data yet.<br />Log your focus entries to track moods!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      {/* <div className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-[#37322F]">
          Quick Access
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {homeDashboardQuickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="border-[#E0DEDB] bg-card shadow-sm transition-all hover:scale-105 hover:shadow-md h-full">
                  <CardHeader className="space-y-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg bg-accent ${link.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold text-[#37322F]">
                        {link.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-[#605A57]">
                        {link.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div> */}

      <div className="space-y-4">
        <h2 className="font-serif text-xl md:text-2xl font-semibold text-[#37322F]">
          Recent Activity
        </h2>
        <Card className="border-[#E0DEDB] bg-card shadow-sm overflow-hidden w-auto max-w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="font-serif text-lg md:text-xl font-semibold text-[#37322F]">
                  Most Recent
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-[#605A57]">
                  Your latest journal entries and decisions
                </CardDescription>
              </div>
              <Link href="/dashboard/archive" className="shrink-0">
                <Button variant="outline" size="sm" className="rounded-full w-full sm:w-auto">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-auto w-auto max-w-full">
            {loading ? (
              <div className="text-center text-[#605A57] py-8">Loading activities...</div>
            ) : stats?.recentActivities && stats.recentActivities.length > 0 && (
              <div className="space-y-3">
                {stats.recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 md:gap-4 rounded-lg border border-[#E0DEDB] p-3 md:p-4 hover:bg-[#F7F5F3]/50 transition-colors overflow-hidden"
                  >
                    <div className={`flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full ${activity.type === 'focus'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-purple-100 text-purple-600'
                      }`}>
                      {activity.type === 'focus' ? (
                        <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <GitBranch className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-semibold text-[#37322F] truncate">
                            {activity.title}
                          </p>
                          <p className="text-[10px] md:text-xs text-[#605A57]">
                            {activity.type === 'focus' ? 'Daily Focus' : 'Decision Made'}
                          </p>
                        </div>
                        <div className="text-[10px] md:text-xs text-[#605A57] shrink-0">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        {activity.status && (
                          <Badge
                            className={`text-[10px] md:text-xs rounded-full border ${getStatusBadgeStyle(activity.status)}`}
                          >
                            {getStatusText(activity.status)}
                          </Badge>
                        )}
                        {activity.category && (
                          <Badge className="text-[10px] md:text-xs rounded-full bg-[#F7F5F3] text-[#605A57] border border-[#E0DEDB] truncate md:max-w-[120px]">
                            {activity.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) 
            // : (
            //   <div className="text-center text-[#605A57] py-8 space-y-3">
            //     <Zap className="h-12 w-12 mx-auto text-[#E0DEDB]" />
            //     <p>No recent activity. Start by adding a focus or decision!</p>
            //     <div className="flex gap-2 justify-center pt-2">
            //       <Link href="/dashboard/daily-focus">
            //         <Button size="sm" className="rounded-full bg-[#37322F] hover:bg-[#49423D]">
            //           Add Focus
            //         </Button>
            //       </Link>
            //       <Link href="/dashboard/decisions">
            //         <Button variant="outline" size="sm" className="rounded-full">
            //           Add Decision
            //         </Button>
            //       </Link>
            //     </div>
            //   </div>
            // )
            }

            {stats?.recentActivities && stats.recentActivities.length > 0 && (
              <div className="pt-3 border-t border-[#E0DEDB]">
                <Link href="/dashboard/archive">
                  <Button
                    variant="ghost"
                    className="w-full rounded-full hover:bg-[#F7F5F3]"
                  >
                    View Complete Archive
                    <ArrowUp className="ml-2 h-4 w-4 rotate-90" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default page;
