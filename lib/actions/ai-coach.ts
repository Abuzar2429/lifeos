"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import { getOrCreateDemoUser } from "./check-in";
import { calculateHabitStats, type HabitWithLogs } from "@/lib/utils/habit-streaks";

export interface AICoachResponse {
  reply: string;
  actionables?: string[];
  contextData?: {
    dailyScore: number;
    sleepHours: number;
    activeStreak: number;
    topGoal?: string;
    recentMood?: string;
  };
}

export async function askAICoach(userPrompt: string): Promise<AICoachResponse> {
  try {
    const user = await getOrCreateDemoUser();
    const today = startOfDay(new Date());

    // Gather Live Context
    const [todayCheckIn, habits, goals, recentJournal] = await Promise.all([
      prisma.dailyCheckIn.findFirst({
        where: { userId: user.id, date: today },
      }),
      prisma.habit.findMany({
        where: { userId: user.id, archived: false },
        include: { logs: true },
      }),
      prisma.goal.findMany({
        where: { userId: user.id, completed: false },
        take: 3,
      }),
      prisma.journalEntry.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Calculate active streaks
    let maxStreak = 0;
    for (const h of habits) {
      const stats = calculateHabitStats(h as unknown as HabitWithLogs);
      if (stats.currentStreak > maxStreak) maxStreak = stats.currentStreak;
    }

    const currentScore = todayCheckIn?.dailyScore ?? 0;
    const sleep = todayCheckIn?.sleepHours ?? 7;
    const topGoalTitle = goals[0]?.title ?? "No active goal";
    const recentMood = recentJournal?.moodTag ?? "#mindset";

    const promptLower = userPrompt.toLowerCase();

    // 1. Prompt Routing & Context Synthesis
    if (promptLower.includes("score") || promptLower.includes("health") || promptLower.includes("performance")) {
      let advice = "";
      if (currentScore >= 80) {
        advice = `You're performing at an exceptional level today with a **Daily Score of ${currentScore}/100**! Key factors driving your score include ${sleep} hours of sleep and consistent habit execution.`;
      } else if (todayCheckIn) {
        advice = `Your current Daily Score stands at **${currentScore}/100**. To push past 80+, consider increasing hydration (aim for 8 glasses) or completing a 20-minute focus session.`;
      } else {
        advice = "You haven't submitted your Daily Check-In for today yet! Submitting your check-in will immediately calculate your holistic performance score.";
      }

      return {
        reply: advice,
        actionables: [
          "Complete today's Daily Check-In",
          "Hydrate with 8 glasses of water",
          "Schedule a 30-min workout session",
        ],
        contextData: { dailyScore: currentScore, sleepHours: sleep, activeStreak: maxStreak, topGoal: topGoalTitle },
      };
    }

    if (promptLower.includes("habit") || promptLower.includes("streak") || promptLower.includes("routine")) {
      const totalHabits = habits.length;
      return {
        reply: `You currently have **${totalHabits} active habits** with a top streak of **${maxStreak} consecutive days**. Maintaining habit momentum is the single highest leverage activity for compound personal growth.`,
        actionables: [
          "Focus on your top daily habit first thing in the morning",
          "Never skip two days in a row to protect momentum",
        ],
        contextData: { dailyScore: currentScore, sleepHours: sleep, activeStreak: maxStreak, topGoal: topGoalTitle },
      };
    }

    if (promptLower.includes("goal") || promptLower.includes("target") || promptLower.includes("milestone")) {
      if (goals.length > 0) {
        const goal = goals[0];
        const progress = Math.round((goal.currentValue / goal.targetValue) * 100);
        return {
          reply: `Your primary active goal is **"${goal.title}"**, which is currently at **${progress}% completion** (${goal.currentValue} / ${goal.targetValue} ${goal.unit || ""}). Breaking larger goals into smaller weekly milestones increases completion likelihood by 3x.`,
          actionables: [
            `Complete sub-milestone for "${goal.title}"`,
            "Review weekly goal target allocations",
          ],
          contextData: { dailyScore: currentScore, sleepHours: sleep, activeStreak: maxStreak, topGoal: goal.title },
        };
      } else {
        return {
          reply: "You don't have any active goals set up yet! Setting 1-3 targeted goals in health, career, or learning provides clear direction for daily habits.",
          actionables: ["Create your first personal goal in the Goals tab"],
        };
      }
    }

    if (promptLower.includes("sentiment") || promptLower.includes("journal") || promptLower.includes("mood")) {
      return {
        reply: recentJournal
          ? `Your latest journal entry was tagged with **${recentJournal.moodTag || "#mindset"}**. Regular self-reflection allows you to process daily stressors and align actions with core values.`
          : "You haven't logged any journal entries recently. Expressing thoughts in writing helps reduce cognitive clutter.",
        actionables: [
          "Write a 2-minute evening reflection",
          "Use mood tags like #gratitude or #mindset to track emotional trends",
        ],
      };
    }

    // General Response
    return {
      reply: `Welcome to your **LifeOS AI Companion**! Based on your live telemetry:\n- **Today's Score**: ${currentScore}/100\n- **Active Streak**: ${maxStreak} Days\n- **Primary Goal**: ${topGoalTitle}\n\nI can analyze your health vectors, suggest habit schedule tweaks, break down goals, or provide sentiment insights. What would you like to focus on today?`,
      actionables: [
        "How can I boost my daily score?",
        "Analyze my habit streak momentum",
        "Help me break down my primary goal",
        "Analyze my reflection sentiment",
      ],
      contextData: { dailyScore: currentScore, sleepHours: sleep, activeStreak: maxStreak, topGoal: topGoalTitle },
    };
  } catch (error) {
    console.error("Error in AI Coach processing:", error);
    return {
      reply: "I am having trouble accessing your telemetry right now. Please try again shortly.",
    };
  }
}
