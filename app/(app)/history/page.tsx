"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Archive } from "lucide-react"
import Link from "next/link"

const weeklyData = [
  { day: "Mon", completed: 1 },
  { day: "Tue", completed: 1 },
  { day: "Wed", completed: 0 },
  { day: "Thu", completed: 1 },
  { day: "Fri", completed: 1 },
  { day: "Sat", completed: 0 },
  { day: "Sun", completed: 1 },
]

const monthlyData = [
  { week: "Week 1", completed: 5 },
  { week: "Week 2", completed: 6 },
  { week: "Week 3", completed: 4 },
  { week: "Week 4", completed: 5 },
]

const decisionCategories = [
  { name: "Career", value: 3, color: "hsl(var(--chart-1))" },
  { name: "Health", value: 5, color: "hsl(var(--chart-2))" },
  { name: "Finance", value: 2, color: "hsl(var(--chart-3))" },
  { name: "Lifestyle", value: 4, color: "hsl(var(--chart-4))" },
]

export default function HistoryPage() {
  const weeklyCompletion = Math.round((5 / 7) * 100)
  const monthlyCompletion = Math.round((20 / 28) * 100)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          History & Reflection
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Review your progress and patterns over time
        </p>
        <div className="mt-6">
          <Link href="/archive">
            <Button variant="outline" className="rounded-full bg-transparent">
              <Archive className="mr-2 h-4 w-4" />
              View Complete Archive
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl font-normal">Weekly Summary</CardTitle>
              <p className="text-sm text-muted-foreground">{weeklyCompletion}% completion rate this week</p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl font-normal">Monthly Summary</CardTitle>
              <p className="text-sm text-muted-foreground">{monthlyCompletion}% completion rate this month</p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">Decision Categories</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of decisions by category</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-2">
              <ChartContainer
                config={{
                  career: { label: "Career", color: "hsl(var(--chart-1))" },
                  health: { label: "Health", color: "hsl(var(--chart-2))" },
                  finance: { label: "Finance", color: "hsl(var(--chart-3))" },
                  lifestyle: { label: "Lifestyle", color: "hsl(var(--chart-4))" },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={decisionCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {decisionCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="flex flex-col justify-center space-y-4">
                {decisionCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{category.value} decisions</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Focus Entries</p>
                <p className="mt-2 font-serif text-4xl font-normal">28</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Decisions</p>
                <p className="mt-2 font-serif text-4xl font-normal">14</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="mt-2 font-serif text-4xl font-normal">5 days</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
