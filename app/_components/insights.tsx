"use client"

import { useState } from "react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
} from "recharts"
import { ChevronLeft, ChevronRight, Send, TrendingUp, Focus as FocusIcon, Zap, Brain } from "lucide-react"
import { Decision, Document, Focus } from "@/lib/generated/prisma"

export function InsightsPage({
    focusEntries,
    decisionEntries,
    docEntries
}: {
    focusEntries: Focus[] | undefined,
    decisionEntries: Decision[] | undefined,
    docEntries: Document[] | undefined,
}) {
    if(!focusEntries || !decisionEntries || !docEntries) return null

    const [selectedWeek, setSelectedWeek] = useState(0)
    const [aiPrompt, setAiPrompt] = useState("")

    // Generate focus trend data (simulated by date grouping)
    const focusTrendData = [
        { day: "Mon", entries: Math.max(1, Math.floor(Math.random() * 5)) },
        { day: "Tue", entries: Math.max(1, Math.floor(Math.random() * 5)) },
        { day: "Wed", entries: Math.max(1, Math.floor(Math.random() * 5)) },
        { day: "Thu", entries: Math.max(1, Math.floor(Math.random() * 5)) },
        { day: "Fri", entries: Math.max(1, Math.floor(Math.random() * 5)) },
        { day: "Sat", entries: Math.max(1, Math.floor(Math.random() * 3)) },
        { day: "Sun", entries: Math.max(1, Math.floor(Math.random() * 3)) },
    ]

    // Decision reflection data (decided vs pending)
    const decisionReflectionData = [
        { name: "Decided", value: Math.max(0, Math.floor(decisionEntries.length * 0.6)) },
        { name: "Pending", value: Math.max(1, Math.floor(decisionEntries.length * 0.4)) },
    ]

    // Mood correlation data
    const moodCorrelationData = [
        { entries: focusEntries.length, productivity: 85, day: "Week 1" },
        { entries: focusEntries.length * 0.8, productivity: 72, day: "Week 2" },
        { entries: focusEntries.length * 1.2, productivity: 91, day: "Week 3" },
        { entries: focusEntries.length * 0.9, productivity: 78, day: "Week 4" },
    ]

    // Calculate clarity score (0-100)
    const clarityScore = Math.min(100, Math.round((focusEntries.length + decisionEntries.length + docEntries.length) * 8))
    const reflectionStreak = Math.min(30, focusEntries.length)

    return (
        <div className="min-h-screen max-w-8xl px-4 pb-4 sm:px-6 lg:px-12 md:p-6">
            {/* Header Section */}
            <div className="border-b border-border">
                <div className="">
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Your Clarity Story</h1>
                    <p className="text-muted-foreground">Data-backed insights into your thinking patterns and growth</p>

                    {/* Clarity Score & AI Highlight */}
                    <div className="mt-8 bg-card/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        {/* Circular Progress - Clarity Score */}
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--color-border))" strokeWidth="2" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="hsl(var(--color-chart-1))"
                                        strokeWidth="2"
                                        strokeDasharray={`${(clarityScore / 100) * 282.7} 282.7`}
                                        className="transition-all duration-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-serif font-bold text-foreground">{clarityScore}</div>
                                        <div className="text-xs text-muted-foreground">clarity</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground mb-1">Weekly Clarity Score</p>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    You've maintained strong focus consistency with {focusEntries.length} entries this week
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8 space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Focus Trends Card */}
                    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-smooth">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-serif font-bold text-foreground">Focus Trends</h3>
                                <p className="text-xs text-muted-foreground">Weekly entry patterns</p>
                            </div>
                            <FocusIcon className="w-5 h-5 text-chart-1" />
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={focusTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                                <XAxis dataKey="day" stroke="hsl(var(--color-muted-foreground))" style={{ fontSize: "12px" }} />
                                <YAxis stroke="hsl(var(--color-muted-foreground))" style={{ fontSize: "12px" }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--color-card))",
                                        border: "1px solid hsl(var(--color-border))",
                                        borderRadius: "var(--radius)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="entries"
                                    stroke="hsl(var(--color-chart-1))"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Decision Reflections Card */}
                    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-smooth">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-serif font-bold text-foreground">Decision Status</h3>
                                <p className="text-xs text-muted-foreground">{decisionEntries.length} total decisions</p>
                            </div>
                            <TrendingUp className="w-5 h-5 text-chart-2" />
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={[
                                    { name: "Decided", value: decisionReflectionData[0].value },
                                    { name: "Pending", value: decisionReflectionData[1].value },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                                <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" style={{ fontSize: "12px" }} />
                                <YAxis stroke="hsl(var(--color-muted-foreground))" style={{ fontSize: "12px" }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--color-card))",
                                        border: "1px solid hsl(var(--color-border))",
                                        borderRadius: "var(--radius)",
                                    }}
                                />
                                <Bar dataKey="value" fill="hsl(var(--color-chart-2))" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Mood & Energy Card */}
                    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-smooth">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-serif font-bold text-foreground">Productivity Correlation</h3>
                                <p className="text-xs text-muted-foreground">Entries vs. energy level</p>
                            </div>
                            <Zap className="w-5 h-5 text-chart-3" />
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                                <XAxis
                                    dataKey="entries"
                                    stroke="hsl(var(--color-muted-foreground))"
                                    type="number"
                                    style={{ fontSize: "12px" }}
                                />
                                <YAxis
                                    dataKey="productivity"
                                    stroke="hsl(var(--color-muted-foreground))"
                                    style={{ fontSize: "12px" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--color-card))",
                                        border: "1px solid hsl(var(--color-border))",
                                        borderRadius: "var(--radius)",
                                    }}
                                />
                                <Scatter dataKey="productivity" data={moodCorrelationData} fill="hsl(var(--color-chart-3))" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Reflection Streak Card */}
                    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-smooth">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-serif font-bold text-foreground">Reflection Streak</h3>
                                <p className="text-xs text-muted-foreground">Consecutive focused days</p>
                            </div>
                            <Brain className="w-5 h-5 text-chart-4" />
                        </div>
                        <div className="flex items-end justify-center h-40">
                            <div className="relative">
                                <div className="text-6xl font-serif font-bold text-foreground text-center">{reflectionStreak}</div>
                                <div className="text-sm text-muted-foreground text-center mt-2">days</div>
                                {/* Shine animation effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Mini-Map */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-serif font-bold text-foreground">Weekly Timeline</h3>
                            <p className="text-xs text-muted-foreground">Navigate through past weeks</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                                className="p-2 hover:bg-muted rounded-lg transition-smooth disabled:opacity-50"
                                disabled={selectedWeek === 0}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setSelectedWeek(selectedWeek + 1)}
                                className="p-2 hover:bg-muted rounded-lg transition-smooth"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Timeline Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((week) => (
                            <div
                                key={week}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-smooth ${selectedWeek === week
                                        ? "border-chart-1 bg-chart-1/5"
                                        : "border-border hover:border-primary/30 bg-card/50"
                                    }`}
                                onClick={() => setSelectedWeek(week)}
                            >
                                <p className="text-sm font-medium text-foreground">Week {4 - week}</p>
                                <p className="text-2xl font-serif font-bold text-chart-1 mt-2">
                                    {Math.max(2, focusEntries.length - week * 3)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">entries</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Prompt Box */}
                {/* <div className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 border border-chart-1/30 rounded-lg p-6">
                    <div className="mb-4">
                        <h3 className="font-serif font-bold text-foreground mb-1">Ask OneDot AI</h3>
                        <p className="text-sm text-muted-foreground">Get personalized suggestions based on your data</p>
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="What should I focus on next week?"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-smooth"
                        />
                        <button className="px-4 py-3 bg-chart-1 text-chart-1 hover:bg-chart-1/90 rounded-lg transition-smooth flex items-center gap-2 font-medium text-sm">
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Ask</span>
                        </button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                        💡 Tip: Ask OneDot about your patterns, next steps, or areas to improve
                    </p>
                </div> */}
            </div>
        </div>
    )
}
