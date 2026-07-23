"use server";

import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";
import { getOrCreateDemoUser } from "./check-in";

export interface HeatmapDay {
  dateStr: string;
  displayDate: string;
  score: number;
  habitsCompleted: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

export async function get365DayHeatmap(): Promise<HeatmapDay[]> {
  try {
    const user = await getOrCreateDemoUser();
    const today = startOfDay(new Date());
    const startDate = subDays(today, 364);

    const [checkIns, habitLogs] = await Promise.all([
      prisma.dailyCheckIn.findMany({
        where: {
          userId: user.id,
          date: { gte: startDate },
        },
      }),
      prisma.habitLog.findMany({
        where: {
          userId: user.id,
          date: { gte: startDate },
          status: true,
        },
      }),
    ]);

    const checkInMap = new Map<string, number>();
    checkIns.forEach((c) => {
      checkInMap.set(format(new Date(c.date), "yyyy-MM-dd"), c.dailyScore);
    });

    const habitMap = new Map<string, number>();
    habitLogs.forEach((l) => {
      const dStr = format(new Date(l.date), "yyyy-MM-dd");
      habitMap.set(dStr, (habitMap.get(dStr) || 0) + 1);
    });

    const days: HeatmapDay[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const displayDate = format(d, "MMM d, yyyy");
      const score = checkInMap.get(dateStr) || 0;
      const habitsCompleted = habitMap.get(dateStr) || 0;

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (score >= 85 || habitsCompleted >= 4) {
        intensity = 4;
      } else if (score >= 70 || habitsCompleted >= 3) {
        intensity = 3;
      } else if (score >= 50 || habitsCompleted >= 2) {
        intensity = 2;
      } else if (score > 0 || habitsCompleted >= 1) {
        intensity = 1;
      }

      days.push({
        dateStr,
        displayDate,
        score,
        habitsCompleted,
        intensity,
      });
    }

    return days;
  } catch (error) {
    console.error("Error generating 365-day heatmap:", error);
    return [];
  }
}
