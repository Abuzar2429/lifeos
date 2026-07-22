import { getTodayCheckIn, getCheckInHistory } from "@/lib/actions/check-in";
import { getHabits } from "@/lib/actions/habit";
import { getGoals } from "@/lib/actions/goal";
import { getJournalEntries } from "@/lib/actions/journal";
import { formatDateLocal } from "@/lib/utils/habit-streaks";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const revalidate = 0; // Disable static caching so dashboard reflects current date/check-ins

export default async function Home() {
  const todayCheckIn = await getTodayCheckIn();
  const history = await getCheckInHistory(7);
  
  // Fetch active habits to calculate today's progress
  const habits = await getHabits(false);
  const todayStr = formatDateLocal(new Date());
  
  const totalHabitsCount = habits.length;
  const completedHabitsCount = habits.filter((h) =>
    h.logs.some((l) => formatDateLocal(new Date(l.date)) === todayStr && l.status)
  ).length;

  // Fetch goals to calculate active goals progress
  const goals = await getGoals();
  const activeGoals = goals.filter((g) => !g.completed);
  const activeGoalsCount = activeGoals.length;

  let totalActiveMilestones = 0;
  let completedActiveMilestones = 0;
  activeGoals.forEach((g) => {
    totalActiveMilestones += g.milestones.length;
    completedActiveMilestones += g.milestones.filter((m) => m.completed).length;
  });

  // Fetch latest journal entry for dashboard preview
  const journalEntries = await getJournalEntries();
  const latestEntry = journalEntries[0] || null;
  const latestJournalTitle = latestEntry ? latestEntry.title : null;
  const latestJournalMood = latestEntry ? latestEntry.moodTag : null;
  const latestJournalSnippet = latestEntry
    ? latestEntry.content.replace(/<[^>]*>/g, " ").trim().slice(0, 75) + (latestEntry.content.replace(/<[^>]*>/g, "").length > 75 ? "..." : "")
    : null;

  const todayScore = todayCheckIn ? todayCheckIn.dailyScore : null;

  return (
    <DashboardClient
      todayCheckIn={todayCheckIn}
      history={history}
      todayScore={todayScore}
      totalHabitsCount={totalHabitsCount}
      completedHabitsCount={completedHabitsCount}
      activeGoalsCount={activeGoalsCount}
      totalActiveMilestones={totalActiveMilestones}
      completedActiveMilestones={completedActiveMilestones}
      latestJournalTitle={latestJournalTitle}
      latestJournalMood={latestJournalMood}
      latestJournalSnippet={latestJournalSnippet}
    />
  );
}
