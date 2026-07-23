"use server";

import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";
import { getOrCreateDemoUser } from "./check-in";

export interface AnalyticsSummary {
  totalCheckIns: number;
  avgDailyScore: number;
  avgSleepHours: number;
  avgWorkoutMins: number;
  avgStudyHours: number;
  avgMood: number;
  correlations: {
    sleepVsScore: { optimalAvg: number; subAvg: number; difference: number };
    workoutVsEnergy: { workoutAvg: number; restAvg: number; difference: number };
    journalVsMood: { journalAvg: number; nonJournalAvg: number; difference: number };
  };
  insights: string[];
  recent30Days: {
    date: string;
    score: number;
    mood: number;
    energy: number;
    sleep: number;
    workout: number;
  }[];
}

export async function getAnalyticsData(days: number = 30): Promise<AnalyticsSummary> {
  try {
    const user = await getOrCreateDemoUser();
    const startDate = subDays(startOfDay(new Date()), days - 1);

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
    });

    const journalDates = new Set(
      journalEntries.map((j) => format(new Date(j.createdAt), "yyyy-MM-dd"))
    );

    if (checkIns.length === 0) {
      return {
        totalCheckIns: 0,
        avgDailyScore: 0,
        avgSleepHours: 0,
        avgWorkoutMins: 0,
        avgStudyHours: 0,
        avgMood: 0,
        correlations: {
          sleepVsScore: { optimalAvg: 0, subAvg: 0, difference: 0 },
          workoutVsEnergy: { workoutAvg: 0, restAvg: 0, difference: 0 },
          journalVsMood: { journalAvg: 0, nonJournalAvg: 0, difference: 0 },
        },
        insights: [
          "Start completing daily check-ins to unlock personalized health & productivity correlation insights!",
        ],
        recent30Days: [],
      };
    }

    const totalScore = checkIns.reduce((acc, c) => acc + c.dailyScore, 0);
    const totalSleep = checkIns.reduce((acc, c) => acc + c.sleepHours, 0);
    const totalWorkout = checkIns.reduce((acc, c) => acc + c.workoutMins, 0);
    const totalStudy = checkIns.reduce((acc, c) => acc + c.studyHours, 0);
    const totalMood = checkIns.reduce((acc, c) => acc + c.mood, 0);

    const count = checkIns.length;
    const avgDailyScore = Math.round(totalScore / count);
    const avgSleepHours = Number((totalSleep / count).toFixed(1));
    const avgWorkoutMins = Math.round(totalWorkout / count);
    const avgStudyHours = Number((totalStudy / count).toFixed(1));
    const avgMood = Number((totalMood / count).toFixed(1));

    // 1. Sleep vs. Daily Score Correlation
    const optimalSleepDays = checkIns.filter((c) => c.sleepHours >= 7 && c.sleepHours <= 9);
    const subSleepDays = checkIns.filter((c) => c.sleepHours < 7 || c.sleepHours > 9);

    const optimalAvg =
      optimalSleepDays.length > 0
        ? Math.round(optimalSleepDays.reduce((acc, c) => acc + c.dailyScore, 0) / optimalSleepDays.length)
        : avgDailyScore;
    const subAvg =
      subSleepDays.length > 0
        ? Math.round(subSleepDays.reduce((acc, c) => acc + c.dailyScore, 0) / subSleepDays.length)
        : avgDailyScore;

    // 2. Workout vs. Energy Correlation
    const workoutDays = checkIns.filter((c) => c.workoutMins >= 20);
    const restDays = checkIns.filter((c) => c.workoutMins < 20);

    const workoutAvg =
      workoutDays.length > 0
        ? Number((workoutDays.reduce((acc, c) => acc + c.energy, 0) / workoutDays.length).toFixed(1))
        : avgMood;
    const restAvg =
      restDays.length > 0
        ? Number((restDays.reduce((acc, c) => acc + c.energy, 0) / restDays.length).toFixed(1))
        : avgMood;

    // 3. Journaling vs. Mood Correlation
    const journaledCheckIns = checkIns.filter((c) =>
      journalDates.has(format(new Date(c.date), "yyyy-MM-dd"))
    );
    const nonJournaledCheckIns = checkIns.filter(
      (c) => !journalDates.has(format(new Date(c.date), "yyyy-MM-dd"))
    );

    const journalAvg =
      journaledCheckIns.length > 0
        ? Number((journaledCheckIns.reduce((acc, c) => acc + c.mood, 0) / journaledCheckIns.length).toFixed(1))
        : avgMood;
    const nonJournalAvg =
      nonJournaledCheckIns.length > 0
        ? Number(
            (nonJournaledCheckIns.reduce((acc, c) => acc + c.mood, 0) / nonJournaledCheckIns.length).toFixed(1)
          )
        : avgMood;

    // Generate Dynamic Insights
    const insights: string[] = [];
    if (optimalAvg - subAvg >= 5) {
      insights.push(
        `Getting 7–9 hours of sleep increases your daily performance score by +${optimalAvg - subAvg} points on average.`
      );
    } else {
      insights.push("Consistent sleep schedule helps stabilize baseline cognitive performance.");
    }

    if (workoutAvg > restAvg) {
      insights.push(
        `Working out for at least 20 minutes boosts your self-reported energy levels by +${(
          workoutAvg - restAvg
        ).toFixed(1)} stars.`
      );
    } else {
      insights.push("Physical movement supports long-term stamina and stress reduction.");
    }

    if (journalAvg > nonJournalAvg) {
      insights.push(
        `Days when you journal correlate with a +${(journalAvg - nonJournalAvg).toFixed(
          1
        )} point boost in overall mood state.`
      );
    } else {
      insights.push("Journaling provides mindful space for daily stress expression.");
    }

    const recent30Days = checkIns.map((c) => ({
      date: format(new Date(c.date), "MMM d"),
      score: c.dailyScore,
      mood: c.mood,
      energy: c.energy,
      sleep: c.sleepHours,
      workout: c.workoutMins,
    }));

    return {
      totalCheckIns: count,
      avgDailyScore,
      avgSleepHours,
      avgWorkoutMins,
      avgStudyHours,
      avgMood,
      correlations: {
        sleepVsScore: { optimalAvg, subAvg, difference: optimalAvg - subAvg },
        workoutVsEnergy: { workoutAvg, restAvg, difference: Number((workoutAvg - restAvg).toFixed(1)) },
        journalVsMood: { journalAvg, nonJournalAvg, difference: Number((journalAvg - nonJournalAvg).toFixed(1)) },
      },
      insights,
      recent30Days,
    };
  } catch (error) {
    console.error("Error computing analytics data:", error);
    return {
      totalCheckIns: 0,
      avgDailyScore: 0,
      avgSleepHours: 0,
      avgWorkoutMins: 0,
      avgStudyHours: 0,
      avgMood: 0,
      correlations: {
        sleepVsScore: { optimalAvg: 0, subAvg: 0, difference: 0 },
        workoutVsEnergy: { workoutAvg: 0, restAvg: 0, difference: 0 },
        journalVsMood: { journalAvg: 0, nonJournalAvg: 0, difference: 0 },
      },
      insights: [],
      recent30Days: [],
    };
  }
}
