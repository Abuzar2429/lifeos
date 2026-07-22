"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfDay, subDays } from "date-fns";
import { calculateDailyScore, type CheckInInput } from "@/lib/scoring";

/**
 * Ensures a default demo user exists for seamless development/testing.
 */
export async function getOrCreateDemoUser() {
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Ashraf (Demo User)",
        email: "demo@lifeos.app",
        isOnboarded: true,
      },
    });
  }

  return user;
}

/**
 * Gets today's start timestamp in local midnight boundaries.
 */
function getTodayMidnight() {
  return startOfDay(new Date());
}

/**
 * Fetches today's check-in for the active user.
 */
export async function getTodayCheckIn() {
  try {
    const user = await getOrCreateDemoUser();
    const todayMidnight = getTodayMidnight();

    const checkIn = await prisma.dailyCheckIn.findFirst({
      where: {
        userId: user.id,
        date: todayMidnight,
      },
    });

    return checkIn;
  } catch (error) {
    console.error("Error fetching today's check-in:", error);
    return null;
  }
}

/**
 * Upserts (creates or updates) today's daily check-in record.
 */
export async function upsertDailyCheckIn(input: CheckInInput) {
  try {
    const user = await getOrCreateDemoUser();
    const todayMidnight = getTodayMidnight();
    const dailyScore = calculateDailyScore(input);

    const existing = await prisma.dailyCheckIn.findFirst({
      where: {
        userId: user.id,
        date: todayMidnight,
      },
    });

    if (existing) {
      const updated = await prisma.dailyCheckIn.update({
        where: { id: existing.id },
        data: {
          mood: input.mood,
          energy: input.energy,
          sleepHours: input.sleepHours,
          waterGlasses: input.waterGlasses,
          workoutMins: input.workoutMins,
          studyHours: input.studyHours,
          readingMins: input.readingMins,
          reflectionNote: input.reflectionNote,
          dailyScore,
        },
      });
      revalidatePath("/");
      return { success: true, checkIn: updated };
    }

    const created = await prisma.dailyCheckIn.create({
      data: {
        userId: user.id,
        date: todayMidnight,
        mood: input.mood,
        energy: input.energy,
        sleepHours: input.sleepHours,
        waterGlasses: input.waterGlasses,
        workoutMins: input.workoutMins,
        studyHours: input.studyHours,
        readingMins: input.readingMins,
        reflectionNote: input.reflectionNote,
        dailyScore,
      },
    });

    revalidatePath("/");
    return { success: true, checkIn: created };
  } catch (error) {
    console.error("Error upserting daily check-in:", error);
    return { success: false, error: "Failed to save daily check-in." };
  }
}

/**
 * Fetches daily check-in history for the past N days.
 */
export async function getCheckInHistory(days: number = 7) {
  try {
    const user = await getOrCreateDemoUser();
    const startDate = subDays(startOfDay(new Date()), days - 1);

    const history = await prisma.dailyCheckIn.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return history;
  } catch (error) {
    console.error("Error fetching check-in history:", error);
    return [];
  }
}
