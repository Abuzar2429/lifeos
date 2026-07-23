"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { parse } from "date-fns";
import { getOrCreateDemoUser } from "./check-in";

export interface CreateHabitInput {
  title: string;
  description?: string;
  category: string;
  frequency: string;
  customDays?: string[];
  targetValue?: number;
  unit?: string;
}

/**
 * Creates a new habit for the demo user.
 */
export async function createHabit(input: CreateHabitInput) {
  try {
    const user = await getOrCreateDemoUser();

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        title: input.title,
        description: input.description || null,
        category: input.category,
        frequency: input.frequency,
        customDays: input.customDays ? JSON.stringify(input.customDays) : null,
        targetValue: input.targetValue ?? 1,
        unit: input.unit || "times",
      },
    });

    revalidatePath("/habits");
    revalidatePath("/");
    return { success: true, habit };
  } catch (error) {
    console.error("Error creating habit:", error);
    return { success: false, error: "Failed to create habit." };
  }
}

/**
 * Fetches all habits for the demo user, including completion logs.
 */
export async function getHabits(includeArchived: boolean = false) {
  try {
    const user = await getOrCreateDemoUser();

    const habits = await prisma.habit.findMany({
      where: {
        userId: user.id,
        ...(includeArchived ? {} : { archived: false }),
      },
      include: {
        logs: {
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return habits;
  } catch (error) {
    console.error("Error fetching habits:", error);
    return [];
  }
}

/**
 * Toggles a habit completion log for a specific date (represented as YYYY-MM-DD local).
 */
export async function toggleHabitLog(habitId: string, dateStr: string) {
  try {
    const user = await getOrCreateDemoUser();

    // Parse the dateStr (e.g. "2026-07-22") into local midnight Date
    const logDate = parse(dateStr, "yyyy-MM-dd", new Date());

    // Look for an existing log for this habit and date
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId,
        userId: user.id,
        date: logDate,
      },
    });

    if (existingLog) {
      // If it exists, delete it (toggle off)
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
      revalidatePath("/habits");
      revalidatePath("/");
      return { success: true, action: "removed" };
    } else {
      // If it doesn't exist, create it (toggle on)
      const habit = await prisma.habit.findUnique({ where: { id: habitId } });
      const targetVal = habit?.targetValue || 1;
      const newLog = await prisma.habitLog.create({
        data: {
          habitId,
          userId: user.id,
          date: logDate,
          status: true,
          value: targetVal,
        },
      });
      revalidatePath("/habits");
      revalidatePath("/");
      return { success: true, action: "created", log: newLog };
    }
  } catch (error) {
    console.error("Error toggling habit log:", error);
    return { success: false, error: "Failed to toggle habit log." };
  }
}

/**
 * Sets or updates numeric progress for a habit log (e.g. 3 out of 5 times).
 */
export async function updateHabitLogValue(habitId: string, dateStr: string, value: number) {
  try {
    const user = await getOrCreateDemoUser();
    const logDate = parse(dateStr, "yyyy-MM-dd", new Date());

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) return { success: false, error: "Habit not found." };

    const targetValue = habit.targetValue || 1;
    const isCompleted = value >= targetValue;

    const existingLog = await prisma.habitLog.findFirst({
      where: { habitId, userId: user.id, date: logDate },
    });

    if (value <= 0) {
      if (existingLog) {
        await prisma.habitLog.delete({ where: { id: existingLog.id } });
      }
      revalidatePath("/habits");
      revalidatePath("/");
      return { success: true, action: "removed", value: 0, isCompleted: false };
    }

    if (existingLog) {
      const updated = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: {
          value,
          status: isCompleted,
        },
      });
      revalidatePath("/habits");
      revalidatePath("/");
      return { success: true, action: "updated", log: updated, isCompleted };
    }

    const created = await prisma.habitLog.create({
      data: {
        habitId,
        userId: user.id,
        date: logDate,
        value,
        status: isCompleted,
      },
    });

    revalidatePath("/habits");
    revalidatePath("/");
    return { success: true, action: "created", log: created, isCompleted };
  } catch (error) {
    console.error("Error updating habit log value:", error);
    return { success: false, error: "Failed to update habit progress." };
  }
}

/**
 * Archives a habit.
 */
export async function archiveHabit(habitId: string) {
  try {
    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: { archived: true },
    });
    revalidatePath("/habits");
    revalidatePath("/");
    return { success: true, habit };
  } catch (error) {
    console.error("Error archiving habit:", error);
    return { success: false, error: "Failed to archive habit." };
  }
}

/**
 * Unarchives a habit.
 */
export async function unarchiveHabit(habitId: string) {
  try {
    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: { archived: false },
    });
    revalidatePath("/habits");
    revalidatePath("/");
    return { success: true, habit };
  } catch (error) {
    console.error("Error unarchiving habit:", error);
    return { success: false, error: "Failed to unarchive habit." };
  }
}

/**
 * Deletes a habit and all associated logs.
 */
export async function deleteHabit(habitId: string) {
  try {
    await prisma.habit.delete({
      where: { id: habitId },
    });
    revalidatePath("/habits");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting habit:", error);
    return { success: false, error: "Failed to delete habit." };
  }
}
