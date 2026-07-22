import { getGoals } from "@/lib/actions/goal";
import { GoalsClient } from "@/components/goals/goals-client";

export const revalidate = 0;

export default async function GoalsPage() {
  const goals = await getGoals();

  // Convert Date objects to ISO strings for RSC boundary transmission
  const serializedGoals = goals.map((goal) => ({
    ...goal,
    targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    milestones: goal.milestones.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
  }));

  return <GoalsClient initialGoals={serializedGoals} />;
}
