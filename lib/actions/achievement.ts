"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "./check-in";
import { calculateHabitStats, type HabitWithLogs } from "@/lib/utils/habit-streaks";

export interface AchievementSeed {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
}

const SEED_ACHIEVEMENTS: AchievementSeed[] = [
  {
    code: "STREAK_3",
    title: "Momentum Starter",
    description: "Maintain a habit streak of 3 consecutive days",
    icon: "Zap",
    category: "Habits",
    threshold: 3,
  },
  {
    code: "STREAK_7",
    title: "Consistency Champion",
    description: "Maintain a habit streak of 7 consecutive days",
    icon: "Flame",
    category: "Habits",
    threshold: 7,
  },
  {
    code: "STREAK_30",
    title: "Unstoppable Force",
    description: "Reach a 30-day habit streak",
    icon: "Crown",
    category: "Habits",
    threshold: 30,
  },
  {
    code: "CHECKIN_1",
    title: "Self-Reflector",
    description: "Complete your first daily check-in",
    icon: "CheckCircle2",
    category: "Wellness",
    threshold: 1,
  },
  {
    code: "CHECKIN_7",
    title: "Wellness Master",
    description: "Complete 7 daily check-ins",
    icon: "HeartPulse",
    category: "Wellness",
    threshold: 7,
  },
  {
    code: "SCORE_90",
    title: "Peak Performance",
    description: "Achieve a daily health score of 90 or higher",
    icon: "Sparkles",
    category: "Wellness",
    threshold: 90,
  },
  {
    code: "GOAL_1",
    title: "Goal Setter",
    description: "Create your first personal goal",
    icon: "Target",
    category: "Goals",
    threshold: 1,
  },
  {
    code: "GOAL_COMPLETE",
    title: "Mission Accomplished",
    description: "Fully complete a personal goal",
    icon: "Trophy",
    category: "Goals",
    threshold: 1,
  },
  {
    code: "JOURNAL_1",
    title: "First Words",
    description: "Write your first journal entry",
    icon: "PenTool",
    category: "Mindset",
    threshold: 1,
  },
  {
    code: "JOURNAL_5",
    title: "Deep Thinker",
    description: "Write 5 journal entries",
    icon: "BookOpen",
    category: "Mindset",
    threshold: 5,
  },
];

/**
 * Ensures default achievements exist in the database.
 */
export async function seedAchievements() {
  try {
    for (const seed of SEED_ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { code: seed.code },
        update: {
          title: seed.title,
          description: seed.description,
          icon: seed.icon,
          category: seed.category,
          threshold: seed.threshold,
        },
        create: seed,
      });
    }
  } catch (error) {
    console.error("Error seeding achievements:", error);
  }
}

/**
 * Fetches all achievements along with the demo user's unlock status.
 */
export async function getAchievements() {
  try {
    const user = await getOrCreateDemoUser();
    await seedAchievements();
    await evaluateUserAchievements();

    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        userAchievements: {
          where: { userId: user.id },
        },
      },
    });

    return achievements.map((ach) => {
      const userAch = ach.userAchievements[0];
      return {
        id: ach.id,
        code: ach.code,
        title: ach.title,
        description: ach.description,
        icon: ach.icon,
        category: ach.category,
        threshold: ach.threshold,
        isUnlocked: Boolean(userAch),
        unlockedAt: userAch?.unlockedAt ? userAch.unlockedAt.toISOString() : null,
      };
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }
}

/**
 * Evaluates current stats and unlocks any newly eligible achievements.
 */
export async function evaluateUserAchievements() {
  try {
    const user = await getOrCreateDemoUser();

    // 1. Fetch user data for evaluation
    const [checkInCount, maxScoreCheckIn, habits, goalCount, completedGoalCount, journalCount] =
      await Promise.all([
        prisma.dailyCheckIn.count({ where: { userId: user.id } }),
        prisma.dailyCheckIn.findFirst({
          where: { userId: user.id },
          orderBy: { dailyScore: "desc" },
        }),
        prisma.habit.findMany({
          where: { userId: user.id },
          include: { logs: true },
        }),
        prisma.goal.count({ where: { userId: user.id } }),
        prisma.goal.count({ where: { userId: user.id, completed: true } }),
        prisma.journalEntry.count({ where: { userId: user.id } }),
      ]);

    // 2. Compute max streak across all habits
    let maxStreak = 0;
    for (const habit of habits) {
      const stats = calculateHabitStats(habit as unknown as HabitWithLogs);
      if (stats.currentStreak > maxStreak) maxStreak = stats.currentStreak;
      if (stats.longestStreak > maxStreak) maxStreak = stats.longestStreak;
    }

    const highestScore = maxScoreCheckIn?.dailyScore ?? 0;

    // 3. Map codes to trigger condition boolean
    const conditions: Record<string, boolean> = {
      STREAK_3: maxStreak >= 3,
      STREAK_7: maxStreak >= 7,
      STREAK_30: maxStreak >= 30,
      CHECKIN_1: checkInCount >= 1,
      CHECKIN_7: checkInCount >= 7,
      SCORE_90: highestScore >= 90,
      GOAL_1: goalCount >= 1,
      GOAL_COMPLETE: completedGoalCount >= 1,
      JOURNAL_1: journalCount >= 1,
      JOURNAL_5: journalCount >= 5,
    };

    const allAchievements = await prisma.achievement.findMany();
    const existingUnlocks = await prisma.userAchievement.findMany({
      where: { userId: user.id },
    });
    const unlockedSet = new Set(existingUnlocks.map((u) => u.achievementId));

    for (const ach of allAchievements) {
      const shouldUnlock = conditions[ach.code];
      if (shouldUnlock && !unlockedSet.has(ach.id)) {
        await prisma.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: ach.id,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error evaluating achievements:", error);
  }
}
