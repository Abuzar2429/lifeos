import { AppShell } from "@/components/layout/app-shell";
import { getAnalyticsData } from "@/lib/actions/analytics";
import { get365DayHeatmap } from "@/lib/actions/heatmap";
import { CorrelationCard } from "@/components/analytics/correlation-card";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import {
  BarChart3,
  Moon,
  Dumbbell,
  BookOpen,
  Sparkles,
  Activity,
  Heart,
  TrendingUp,
} from "lucide-react";

export const revalidate = 0;

export default async function AnalyticsPage() {
  const data = await getAnalyticsData(30);
  const heatmapDays = await get365DayHeatmap();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-violet-950/40 via-zinc-900/60 to-zinc-950/80 p-6 md:p-8 rounded-3xl border border-violet-500/20 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
            <BarChart3 className="h-3.5 w-3.5" />
            Performance & Correlations
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Analytics & Holistic Insights
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Deep-dive into your 30-day health trends, sleep-mood correlations, and productivity vectors.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{data.avgDailyScore}</div>
            <div className="text-xs font-medium text-zinc-400">30-Day Avg Score</div>
          </div>
        </div>
      </div>

      {/* 4 Vector Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Avg Sleep</span>
            <Moon className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {data.avgSleepHours} <span className="text-xs font-normal text-zinc-400">hrs/day</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Avg Workout</span>
            <Dumbbell className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {data.avgWorkoutMins} <span className="text-xs font-normal text-zinc-400">mins/day</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Avg Focus</span>
            <BookOpen className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {data.avgStudyHours} <span className="text-xs font-normal text-zinc-400">hrs/day</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Avg Mood</span>
            <Heart className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {data.avgMood} <span className="text-xs font-normal text-zinc-400">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Cross-Vector Correlations Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          Cross-Vector Correlations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CorrelationCard
            title="Sleep vs. Daily Score"
            subtitle="7-9h Target Window"
            iconName="Moon"
            primaryMetric={{ label: "Optimal Sleep Score", value: `${data.correlations.sleepVsScore.optimalAvg} pts` }}
            secondaryMetric={{ label: "Sub-Optimal Score", value: `${data.correlations.sleepVsScore.subAvg} pts` }}
            impactText={`Optimal sleep delivers +${data.correlations.sleepVsScore.difference} pts higher performance.`}
            isPositive={data.correlations.sleepVsScore.difference >= 0}
          />

          <CorrelationCard
            title="Exercise vs. Energy"
            subtitle="20+ Mins Active Days"
            iconName="Zap"
            primaryMetric={{ label: "Active Day Energy", value: `${data.correlations.workoutVsEnergy.workoutAvg} ★` }}
            secondaryMetric={{ label: "Rest Day Energy", value: `${data.correlations.workoutVsEnergy.restAvg} ★` }}
            impactText={`Movement yields +${data.correlations.workoutVsEnergy.difference} star increase in vitality.`}
            isPositive={data.correlations.workoutVsEnergy.difference >= 0}
          />

          <CorrelationCard
            title="Journaling vs. Mood"
            subtitle="Daily Reflection Entries"
            iconName="BookOpen"
            primaryMetric={{ label: "Journaled Day Mood", value: `${data.correlations.journalVsMood.journalAvg} ★` }}
            secondaryMetric={{ label: "Unlogged Day Mood", value: `${data.correlations.journalVsMood.nonJournalAvg} ★` }}
            impactText={`Reflection adds +${data.correlations.journalVsMood.difference} star emotional clarity.`}
            isPositive={data.correlations.journalVsMood.difference >= 0}
          />
        </div>
      </div>

      {/* 365-Day Activity Heatmap */}
      <ActivityHeatmap days={heatmapDays} />

      {/* Automated AI Insights */}
      <div className="bg-gradient-to-br from-indigo-950/30 to-zinc-900/80 border border-indigo-500/20 p-6 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          Key Insights & Actionable Takeaways
        </h3>
        <div className="space-y-3">
          {data.insights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/60 text-sm text-zinc-300"
            >
              <div className="h-2 w-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    </AppShell>
  );
}
