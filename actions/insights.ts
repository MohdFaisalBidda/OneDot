"use server";

import { requireUser } from "./auth";
import prisma from "@/lib/prismaClient";

export type SmartInsight = {
  type: "trend" | "pattern" | "recommendation" | "achievement";
  message: string;
  details?: string;
};

export async function getSmartInsights() {
  try {
    const user = await requireUser();
    const insights: SmartInsight[] = [];

    // Get user's focus entries and decisions
    const focuses = await prisma.focus.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30, // Last 30 entries for analysis
    });

    const decisions = await prisma.decision.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    });

    // Analyze streak pattern
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      const hasEntry = focuses.some(f => {
        const entryDate = new Date(f.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      if (hasEntry) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Insight 1: Streak Achievement
    if (currentStreak >= 7) {
      insights.push({
        type: "achievement",
        message: `Incredible! You've maintained a ${currentStreak}-day streak!`,
        details: "Consistency is key to building lasting habits. Keep it up!",
      });
    } else if (currentStreak >= 3) {
      insights.push({
        type: "trend",
        message: `You're building momentum with a ${currentStreak}-day streak!`,
        details: "You're just days away from forming a solid habit. Don't break the chain!",
      });
    }

    // Insight 2: Most productive category
    if (decisions.length > 0) {
      const categoryCount: Record<string, number> = {};
      decisions.forEach(d => {
        categoryCount[d.category] = (categoryCount[d.category] || 0) + 1;
      });
      
      const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
      if (topCategory && topCategory[1] >= 3) {
        insights.push({
          type: "pattern",
          message: `Most of your decisions focus on ${topCategory[0].toLowerCase()}`,
          details: `You've made ${topCategory[1]} ${topCategory[0].toLowerCase()}-related decisions. This shows where your priorities lie.`,
        });
      }
    }

    // Insight 3: Completion rate analysis
    const achievedCount = focuses.filter(
      f => f.status === "ACHIEVED" || f.status === "PARTIALLY_ACHIEVED"
    ).length;
    const completionRate = focuses.length > 0 ? Math.round((achievedCount / focuses.length) * 100) : 0;

    if (completionRate >= 80) {
      insights.push({
        type: "achievement",
        message: `Outstanding ${completionRate}% completion rate!`,
        details: "You're consistently achieving your goals. This is exceptional!",
      });
    } else if (completionRate >= 50 && completionRate < 80) {
      insights.push({
        type: "recommendation",
        message: `Your ${completionRate}% completion rate has room for improvement`,
        details: "Try setting smaller, more achievable daily goals to boost your success rate.",
      });
    } else if (focuses.length > 5) {
      insights.push({
        type: "recommendation",
        message: "Consider breaking down your goals into smaller tasks",
        details: "Smaller, specific goals are easier to achieve and help build momentum.",
      });
    }

    // Insight 4: Mood pattern analysis
    if (focuses.length >= 7) {
      const moodCount: Record<string, number> = {};
      focuses.forEach(f => {
        moodCount[f.mood] = (moodCount[f.mood] || 0) + 1;
      });
      
      const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];
      if (dominantMood) {
        const moodPercentage = Math.round((dominantMood[1] / focuses.length) * 100);
        if (moodPercentage >= 50) {
          insights.push({
            type: "pattern",
            message: `You're feeling "${dominantMood[0]}" ${moodPercentage}% of the time`,
            details: "Your emotional patterns can help you identify what activities and decisions impact your well-being.",
          });
        }
      }
    }

    // Insight 5: Recent activity trend
    const last7Days = focuses.filter(f => {
      const daysDiff = Math.floor((today.getTime() - new Date(f.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length;

    const previous7Days = focuses.filter(f => {
      const daysDiff = Math.floor((today.getTime() - new Date(f.date).getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7 && daysDiff <= 14;
    }).length;

    if (last7Days > previous7Days && previous7Days > 0) {
      const increase = Math.round(((last7Days - previous7Days) / previous7Days) * 100);
      insights.push({
        type: "trend",
        message: `Your activity increased by ${increase}% this week!`,
        details: "You're trending upward. This momentum will compound over time.",
      });
    } else if (previous7Days > last7Days && last7Days > 0) {
      insights.push({
        type: "recommendation",
        message: "Your activity has decreased compared to last week",
        details: "Don't lose momentum! Try setting a small goal for tomorrow to get back on track.",
      });
    }

    // Insight 6: Time-based recommendation
    const hour = new Date().getHours();
    if (insights.length < 3 && focuses.length === 0) {
      if (hour < 12) {
        insights.push({
          type: "recommendation",
          message: "Start your day strong by setting your focus!",
          details: "Morning planning sets the tone for a productive day.",
        });
      } else if (hour >= 18) {
        insights.push({
          type: "recommendation",
          message: "End your day with reflection",
          details: "Evening journaling helps consolidate learnings and prepare for tomorrow.",
        });
      }
    }

    // If no insights generated, provide encouragement
    if (insights.length === 0) {
      insights.push({
        type: "recommendation",
        message: "Start building your data!",
        details: "Log your daily focus and decisions to unlock personalized AI insights.",
      });
    }

    return { data: insights };
  } catch (error) {
    console.error("Error generating smart insights:", error);
    return { error: "Failed to generate insights" };
  }
}
