"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getOrCreateDemoUser } from "./check-in";

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: string;
  timeframe: string;
  targetValue?: number;
  unit?: string;
  targetDate?: string;
  milestones?: string[];
}

/**
 * Creates a new goal with nested milestones for the demo user.
 */
export async function createGoal(input: CreateGoalInput) {
  try {
    const user = await getOrCreateDemoUser();

    // Parse targetDate string to local midnight Date
    let deadline: Date | null = null;
    if (input.targetDate) {
      const parts = input.targetDate.split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      deadline = new Date(year, month, day);
    }

    // Build the milestones list to create inline
    const milestonesCreate = input.milestones
      ? input.milestones.filter((m) => m.trim() !== "").map((m) => ({ title: m.trim() }))
      : [];

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: input.title,
        description: input.description || null,
        category: input.category,
        timeframe: input.timeframe,
        targetValue: input.targetValue ?? 100.0,
        currentValue: 0.0,
        unit: input.unit || "%",
        completed: false,
        targetDate: deadline,
        milestones: {
          create: milestonesCreate,
        },
      },
      include: {
        milestones: true,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true, goal };
  } catch (error) {
    console.error("Error creating goal:", error);
    return { success: false, error: "Failed to create goal." };
  }
}

/**
 * Fetches all goals (with milestones) for the demo user.
 */
export async function getGoals() {
  try {
    const user = await getOrCreateDemoUser();

    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
      },
      include: {
        milestones: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return goals;
  } catch (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
}

/**
 * Updates the numerical progress of a goal.
 */
export async function updateGoalProgress(goalId: string, currentValue: number) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return { success: false, error: "Goal not found." };
    }

    const value = Math.max(0, currentValue);
    const completed = value >= goal.targetValue;

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue: value,
        completed,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true, goal: updated };
  } catch (error) {
    console.error("Error updating goal progress:", error);
    return { success: false, error: "Failed to update progress." };
  }
}

/**
 * Toggles a milestone completion state.
 */
export async function toggleMilestone(milestoneId: string) {
  try {
    const milestone = await prisma.goalMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return { success: false, error: "Milestone not found." };
    }

    const updated = await prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: {
        completed: !milestone.completed,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true, milestone: updated };
  } catch (error) {
    console.error("Error toggling milestone:", error);
    return { success: false, error: "Failed to toggle milestone." };
  }
}

/**
 * Adds a new milestone to an existing goal.
 */
export async function addMilestone(goalId: string, title: string) {
  try {
    if (!title.trim()) {
      return { success: false, error: "Milestone title cannot be empty." };
    }

    const milestone = await prisma.goalMilestone.create({
      data: {
        goalId,
        title: title.trim(),
        completed: false,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true, milestone };
  } catch (error) {
    console.error("Error adding milestone:", error);
    return { success: false, error: "Failed to add milestone." };
  }
}

/**
 * Deletes a milestone.
 */
export async function deleteMilestone(milestoneId: string) {
  try {
    await prisma.goalMilestone.delete({
      where: { id: milestoneId },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return { success: false, error: "Failed to delete milestone." };
  }
}

/**
 * Deletes a goal and its associated milestones.
 */
export async function deleteGoal(goalId: string) {
  try {
    await prisma.goal.delete({
      where: { id: goalId },
    });

    revalidatePath("/goals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: "Failed to delete goal." };
  }
}
