"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { HistoryData } from "@/actions/history"

interface HistoryChartsProps {
  historyData: HistoryData
}

export default function HistoryCharts({ historyData }: HistoryChartsProps) {
  const hasWeeklyData = historyData.weeklyData.some(d => d.completed > 0)
  const hasMonthlyData = historyData.monthlyData.some(d => d.completed > 0)
  const hasDecisionData = historyData.decisionCategories.length > 0

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">Weekly Summary</CardTitle>
            <p className="text-sm text-muted-foreground">
              {historyData.stats.weeklyCompletion}% completion rate this week
            </p>
          </CardHeader>
          <CardContent>
            {hasWeeklyData ? (
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px]"
              >
                <BarChart data={historyData.weeklyData}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No completed focus entries this week</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">Monthly Summary</CardTitle>
            <p className="text-sm text-muted-foreground">
              {historyData.stats.monthlyCompletion}% completion rate this month
            </p>
          </CardHeader>
          <CardContent>
            {hasMonthlyData ? (
              <ChartContainer
                config={{
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[200px]"
              >
                <BarChart data={historyData.monthlyData}>
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No completed focus entries this month</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-normal">Decision Categories</CardTitle>
          <p className="text-sm text-muted-foreground">Distribution of decisions by category</p>
        </CardHeader>
        <CardContent>
          {hasDecisionData ? (
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
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie 
                    data={historyData.decisionCategories} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                  >
                    {historyData.decisionCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="flex flex-col justify-center space-y-4">
                {historyData.decisionCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-4 w-4 rounded-full" 
                        style={{ backgroundColor: category.color }} 
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{category.value} decisions</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No decisions tracked yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
