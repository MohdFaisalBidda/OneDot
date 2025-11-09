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
  ArrowRight,
} from "lucide-react";
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
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"


const focusData = [
  { name: "Mon", value: 4 },
  { name: "Tue", value: 3 },
  { name: "Wed", value: 2 },
  { name: "Thu", value: 5 },
  { name: "Fri", value: 4 },
  { name: "Sat", value: 2 },
  { name: "Sun", value: 3 },
]

const clarityData = [
  { name: "Week 1", clarity: 65 },
  { name: "Week 2", clarity: 72 },
  { name: "Week 3", clarity: 68 },
  { name: "Week 4", clarity: 82 },
]

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
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-2xl md:text-4xl font-semibold text-[#37322F]">
              {greeting}, {session?.user?.name}
            </h1>
          </div>
          <p className="text-sm md:text-lg text-[#605A57]">
            Here's your complete overview and insights
          </p>
        </div>
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Focus", value: "3", color: "from-chart-1" },
          { label: "Active Decisions", value: "2", color: "from-chart-2" },
          { label: "Clarity Score", value: "82%", color: "from-chart-3" },
          { label: "Docs Created", value: "12", color: "from-chart-4" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-lg p-6 border border-border">
            <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
            <p
              className={`text-3xl font-serif font-bold bg-gradient-to-r ${stat.color} to-primary bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Focus */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h4 className="text-lg font-serif font-bold text-foreground mb-6">Weekly Focus Sessions</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={focusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.625rem",
                }}
              />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Clarity Score Trend */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h4 className="text-lg font-serif font-bold text-foreground mb-6">Clarity Score Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={clarityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.625rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="clarity"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-2)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="bg-primary text-primary-foreground rounded-lg p-6 hover:opacity-90 transition-smooth flex items-center justify-between group">
          <div>
            <h5 className="font-serif font-bold text-lg">Start Today's Focus</h5>
            <p className="text-sm opacity-90">Set your intention for today</p>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-smooth" />
        </button>

        <button className="bg-card border border-border rounded-lg p-6 hover:bg-muted transition-smooth flex items-center justify-between group">
          <div className="text-left">
            <h5 className="font-serif font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Insights
            </h5>
            <p className="text-sm text-muted-foreground">Get personalized guidance</p>
          </div>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-smooth text-muted-foreground" />
        </button>
      </div> */}
    </div>
  );
}

export default page;
