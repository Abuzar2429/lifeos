"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "./check-in";

export interface SearchResultItem {
  id: string;
  type: "habit" | "goal" | "journal" | "page";
  title: string;
  subtitle: string;
  url: string;
}

export async function searchLifeOS(query: string): Promise<SearchResultItem[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const user = await getOrCreateDemoUser();
    const q = query.trim();

    const [habits, goals, journals] = await Promise.all([
      prisma.habit.findMany({
        where: {
          userId: user.id,
          title: { contains: q },
        },
        take: 5,
      }),
      prisma.goal.findMany({
        where: {
          userId: user.id,
          title: { contains: q },
        },
        take: 5,
      }),
      prisma.journalEntry.findMany({
        where: {
          userId: user.id,
          OR: [{ title: { contains: q } }, { content: { contains: q } }],
        },
        take: 5,
      }),
    ]);

    const results: SearchResultItem[] = [];

    habits.forEach((h) => {
      results.push({
        id: h.id,
        type: "habit",
        title: h.title,
        subtitle: `${h.category} Habit • ${h.frequency}`,
        url: "/habits",
      });
    });

    goals.forEach((g) => {
      results.push({
        id: g.id,
        type: "goal",
        title: g.title,
        subtitle: `${g.category} Goal • ${g.timeframe}`,
        url: "/goals",
      });
    });

    journals.forEach((j) => {
      results.push({
        id: j.id,
        type: "journal",
        title: j.title,
        subtitle: `Journal Entry ${j.moodTag || ""}`,
        url: "/journal",
      });
    });

    return results;
  } catch (error) {
    console.error("Error performing search:", error);
    return [];
  }
}
