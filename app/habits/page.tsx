import { getHabits } from "@/lib/actions/habit";
import { get365DayHeatmap } from "@/lib/actions/heatmap";
import { HabitsClient } from "@/components/habits/habits-client";

export const revalidate = 0;

export default async function HabitsPage() {
  const habits = await getHabits(true);
  const heatmapDays = await get365DayHeatmap();

  // Serialize Date objects to strings for RSC -> Client Component boundary
  const serializedHabits = habits.map((habit) => ({
    ...habit,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    logs: habit.logs.map((log) => ({
      ...log,
      date: log.date.toISOString(),
      completedAt: log.completedAt.toISOString(),
    })),
  }));

  return <HabitsClient initialHabits={serializedHabits} heatmapDays={heatmapDays} />;
}
