"use client";

import {
  Sparkles,
  Activity,
  Smile,
  Moon,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Target,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendWidget, CheckInHistoryItem } from "@/components/dashboard/trend-widget";
import { DailyDigestWidget } from "@/components/dashboard/daily-digest-widget";
import { type ExecutiveDigest } from "@/lib/actions/digest";
import { type CheckInInput } from "@/lib/scoring";

interface DashboardClientProps {
  digest: ExecutiveDigest;
  todayCheckIn: CheckInInput | null;
  history: CheckInHistoryItem[];
  todayScore: number | null;
  totalHabitsCount?: number;
  completedHabitsCount?: number;
  activeGoalsCount?: number;
  totalActiveMilestones?: number;
  completedActiveMilestones?: number;
  latestJournalTitle?: string | null;
  latestJournalMood?: string | null;
  latestJournalSnippet?: string | null;
}

export function DashboardClient({
  digest,
  todayCheckIn,
  history,
  todayScore,
  totalHabitsCount = 0,
  completedHabitsCount = 0,
  activeGoalsCount = 0,
  totalActiveMilestones = 0,
  completedActiveMilestones = 0,
  latestJournalTitle = null,
  latestJournalMood = null,
  latestJournalSnippet = null,
}: DashboardClientProps) {
  const getScoreStatus = (score: number | null) => {
    if (score === null) return { label: "Not Logged", color: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    if (score >= 85) return { label: "Peak State 🚀", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
    if (score >= 70) return { label: "High Flow ✨", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" };
    if (score >= 50) return { label: "Steady Pace 👍", color: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
    return { label: "Needs Recovery 🔋", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
  };

  const status = getScoreStatus(todayScore);

  return (
    <AppShell todayCheckIn={todayCheckIn} todayScore={todayScore}>
      {/* Executive Daily Digest Banner */}
      <DailyDigestWidget digest={digest} />

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Daily Score"
          value={todayScore !== null ? `${todayScore}` : "--"}
          subtitle="Overall daily score"
          icon={Activity}
          gradient="from-indigo-600/20 via-indigo-900/10 to-transparent"
          iconColor="text-indigo-400"
          badge={status.label}
          badgeColor={status.color}
        />

        <MetricCard
          title="Mood & Energy"
          value={
            todayCheckIn
              ? `${todayCheckIn.mood}/5 • ${todayCheckIn.energy}/5`
              : "-- / --"
          }
          subtitle="Wellness rating"
          icon={Smile}
          gradient="from-emerald-600/15 via-emerald-900/5 to-transparent"
          iconColor="text-emerald-400"
          badge={todayCheckIn ? "Logged" : "Pending"}
          badgeColor={
            todayCheckIn
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : "bg-zinc-800 text-zinc-400 border-zinc-700"
          }
        />

        <MetricCard
          title="Sleep & Hydration"
          value={
            todayCheckIn
              ? `${todayCheckIn.sleepHours}h • ${todayCheckIn.waterGlasses} glasses`
              : "--"
          }
          subtitle="Rest & Water target"
          icon={Moon}
          gradient="from-cyan-600/15 via-cyan-900/5 to-transparent"
          iconColor="text-cyan-400"
          badge={todayCheckIn?.waterGlasses ? `${todayCheckIn.waterGlasses}/8 Glasses` : undefined}
          badgeColor="bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
        />

        <MetricCard
          title="Productivity"
          value={
            todayCheckIn
              ? `${todayCheckIn.studyHours}h study • ${todayCheckIn.workoutMins}m workout`
              : "--"
          }
          subtitle="Focus & Health activity"
          icon={GraduationCap}
          gradient="from-violet-600/15 via-violet-900/5 to-transparent"
          iconColor="text-violet-400"
          badge={todayCheckIn?.workoutMins ? `${todayCheckIn.workoutMins}m active` : undefined}
          badgeColor="bg-violet-500/15 text-violet-300 border-violet-500/30"
        />
      </div>

      {/* 7-Day Performance Trend Chart & Reflections */}
      <TrendWidget history={history} />

      {/* Quick Access Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/habits"
          className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl hover:border-indigo-500/40 hover:bg-zinc-900/80 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <CheckSquare className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">Habit Tracker</h3>
          {totalHabitsCount > 0 ? (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Today&apos;s Progress</span>
                <span className="font-semibold text-indigo-400">{completedHabitsCount}/{totalHabitsCount} done</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/40">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(completedHabitsCount / totalHabitsCount) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 mt-1">
              Build consistency with daily streaks and target tracking.
            </p>
          )}
        </Link>

        <Link
          href="/goals"
          className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl hover:border-purple-500/40 hover:bg-zinc-900/80 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Target className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">Goal Milestones</h3>
          {activeGoalsCount > 0 ? (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Active Objectives</span>
                <span className="font-semibold text-purple-400">
                  {activeGoalsCount} active {totalActiveMilestones > 0 && `• ${completedActiveMilestones}/${totalActiveMilestones} tasks`}
                </span>
              </div>
              {totalActiveMilestones > 0 && (
                <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/40">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(completedActiveMilestones / totalActiveMilestones) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 mt-1">
              Define yearly and monthly objectives with step-by-step milestones.
            </p>
          )}
        </Link>

        <Link
          href="/journal"
          className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-base font-bold text-white mt-4">Smart Journal</h3>
          {latestJournalTitle ? (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5">
                {latestJournalMood && (
                  <span className="text-xs">
                    {latestJournalMood === "Happy"
                      ? "😄"
                      : latestJournalMood === "Calm"
                      ? "😌"
                      : latestJournalMood === "Tired"
                      ? "😴"
                      : latestJournalMood === "Anxious"
                      ? "😰"
                      : latestJournalMood === "Motivated"
                      ? "🚀"
                      : "📝"}
                  </span>
                )}
                <span className="text-[11px] font-bold text-emerald-405 truncate max-w-[185px]">
                  {latestJournalTitle}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                &ldquo;{latestJournalSnippet}&rdquo;
              </p>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 mt-1">
              Rich-text reflections tagged with mood and sentiment analysis.
            </p>
          )}
        </Link>
      </div>
    </AppShell>
  );
}
