"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateDemoUser } from "./check-in";

export interface UserPreferencesData {
  focusAreas: string[];
  topPriorities: string[];
  themeMode: string;
}

/**
 * Fetches user preferences from database.
 */
export async function getUserPreferences(): Promise<UserPreferencesData> {
  try {
    const user = await getOrCreateDemoUser();

    let pref = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!pref) {
      pref = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          focusAreas: JSON.stringify(["Health", "Study", "Career", "Mindfulness"]),
          topPriorities: JSON.stringify(["Build daily habits", "Improve sleep schedule", "Track long-term goals"]),
          themeMode: "dark",
        },
      });
    }

    return {
      focusAreas: JSON.parse(pref.focusAreas || "[]"),
      topPriorities: JSON.parse(pref.topPriorities || "[]"),
      themeMode: pref.themeMode || "dark",
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return {
      focusAreas: ["Health", "Study", "Career"],
      topPriorities: ["Build daily habits"],
      themeMode: "dark",
    };
  }
}

/**
 * Updates user preferences in database.
 */
export async function updateUserPreferences(input: UserPreferencesData) {
  try {
    const user = await getOrCreateDemoUser();

    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        focusAreas: JSON.stringify(input.focusAreas),
        topPriorities: JSON.stringify(input.topPriorities),
        themeMode: input.themeMode,
      },
      create: {
        userId: user.id,
        focusAreas: JSON.stringify(input.focusAreas),
        topPriorities: JSON.stringify(input.topPriorities),
        themeMode: input.themeMode,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { success: false, error: "Failed to update preferences." };
  }
}

/**
 * Exports all user data into a structured JSON string for offline backup.
 */
export async function exportAllUserData() {
  try {
    const user = await getOrCreateDemoUser();

    const [checkIns, habits, goals, journalEntries, achievements, preferences] =
      await Promise.all([
        prisma.dailyCheckIn.findMany({ where: { userId: user.id } }),
        prisma.habit.findMany({
          where: { userId: user.id },
          include: { logs: true },
        }),
        prisma.goal.findMany({
          where: { userId: user.id },
          include: { milestones: true },
        }),
        prisma.journalEntry.findMany({ where: { userId: user.id } }),
        prisma.userAchievement.findMany({
          where: { userId: user.id },
          include: { achievement: true },
        }),
        prisma.userPreferences.findUnique({ where: { userId: user.id } }),
      ]);

    const backupData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      preferences,
      checkIns,
      habits,
      goals,
      journalEntries,
      achievements,
    };

    return { success: true, json: JSON.stringify(backupData, null, 2) };
  } catch (error) {
    console.error("Error exporting user data:", error);
    return { success: false, error: "Failed to export data." };
  }
}
