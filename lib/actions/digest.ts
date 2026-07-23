"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, format } from "date-fns";
import { getOrCreateDemoUser } from "./check-in";
import { calculateHabitStats, type HabitWithLogs } from "@/lib/utils/habit-streaks";

export interface ExecutiveDigest {
  greeting: string;
  dateStr: string;
  hasCheckInToday: boolean;
  todayScore: number;
  topHabitTitle?: string;
  topHabitStreak?: number;
  topGoalTitle?: string;
  topGoalProgress?: number;
  dailyWisdom: string;
}

const WISDOM_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "Small daily improvements over time lead to stunning long-term results.",
  "Focus on progress, not perfection.",
  "Energy flows where attention goes.",
];

export async function getExecutiveDailyDigest(): Promise<ExecutiveDigest> {
  try {
    const user = await getOrCreateDemoUser();
    const today = startOfDay(new Date());
    const dateStr = format(new Date(), "EEEE, MMMM d, yyyy");

    const [todayCheckIn, habits, goals] = await Promise.all([
      prisma.dailyCheckIn.findFirst({
        where: { userId: user.id, date: today },
      }),
      prisma.habit.findMany({
        where: { userId: user.id, archived: false },
        include: { logs: true },
      }),
      prisma.goal.findMany({
        where: { userId: user.id, completed: false },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
    ]);

    // Find habit with highest streak
    let topHabitTitle: string | undefined;
    let topHabitStreak = 0;

    for (const h of habits) {
      const stats = calculateHabitStats(h as unknown as HabitWithLogs);
      if (stats.currentStreak >= topHabitStreak) {
        topHabitStreak = stats.currentStreak;
        topHabitTitle = h.title;
      }
    }

    const topGoal = goals[0];
    const topGoalProgress = topGoal
      ? Math.round((topGoal.currentValue / topGoal.targetValue) * 100)
      : 0;

    // Pick quote based on day of year
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const dailyWisdom = WISDOM_QUOTES[dayOfYear % WISDOM_QUOTES.length];

    const currentHour = new Date().getHours();
    let greeting = "Good morning";
    if (currentHour >= 12 && currentHour < 17) greeting = "Good afternoon";
    if (currentHour >= 17) greeting = "Good evening";

    return {
      greeting,
      dateStr,
      hasCheckInToday: Boolean(todayCheckIn),
      todayScore: todayCheckIn?.dailyScore ?? 0,
      topHabitTitle,
      topHabitStreak,
      topGoalTitle: topGoal?.title,
      topGoalProgress,
      dailyWisdom,
    };
  } catch (error) {
    console.error("Error generating executive digest:", error);
    return {
      greeting: "Welcome back",
      dateStr: format(new Date(), "EEEE, MMMM d, yyyy"),
      hasCheckInToday: false,
      todayScore: 0,
      dailyWisdom: "Focus on progress, not perfection.",
    };
  }
}
