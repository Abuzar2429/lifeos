"use client";

import { Sparkles, Calendar, Flame, Target, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ExecutiveDigest } from "@/lib/actions/digest";

export function DailyDigestWidget({ digest }: { digest: ExecutiveDigest }) {
  return (
    <div className="neo-glass relative overflow-hidden rounded-3xl p-6 md:p-8 space-y-6">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 dark:bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>Executive Daily Digest</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {digest.greeting}, Ashraf!
          </h1>
        </div>

        <div className="neo-inset flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 px-3 py-1.5 rounded-xl w-fit">
          <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{digest.dateStr}</span>
        </div>
      </div>

      {/* 3 Telemetry Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Score Pillar */}
        <div className="neo-inset p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Health Score
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">
              {digest.hasCheckInToday ? `${digest.todayScore} / 100` : "Check-in Pending"}
            </div>
          </div>

          <Link
            href="/"
            className="neo-button flex h-8 w-8 items-center justify-center rounded-xl text-indigo-600 dark:text-indigo-400 transition-all"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Top Habit Pillar */}
        <div className="neo-inset p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              Top Habit Streak
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white truncate max-w-[140px]">
              {digest.topHabitTitle ? `${digest.topHabitStreak}d Streak` : "No Habits"}
            </div>
          </div>

          <Link
            href="/habits"
            className="neo-button flex h-8 w-8 items-center justify-center rounded-xl text-amber-600 dark:text-amber-400 transition-all"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Primary Goal Pillar */}
        <div className="neo-inset p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Primary Goal
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white truncate max-w-[140px]">
              {digest.topGoalTitle ? `${digest.topGoalProgress}% Done` : "Set a Goal"}
            </div>
          </div>

          <Link
            href="/goals"
            className="neo-button flex h-8 w-8 items-center justify-center rounded-xl text-emerald-600 dark:text-emerald-400 transition-all"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Daily Wisdom Footer */}
      <div className="pt-2 text-xs italic text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
        <span>&quot;{digest.dailyWisdom}&quot;</span>
      </div>
    </div>
  );
}
