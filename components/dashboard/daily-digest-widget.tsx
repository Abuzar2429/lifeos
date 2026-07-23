"use client";

import { Sparkles, Calendar, Flame, Target, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ExecutiveDigest } from "@/lib/actions/digest";

export function DailyDigestWidget({ digest }: { digest: ExecutiveDigest }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-zinc-900/90 to-zinc-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl space-y-6">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>Executive Daily Digest</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {digest.greeting}, Ashraf!
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-3 py-1.5 rounded-xl w-fit">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span>{digest.dateStr}</span>
        </div>
      </div>

      {/* 3 Telemetry Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Score Pillar */}
        <div className="bg-zinc-950/60 border border-zinc-800/60 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-400" />
              Health Score
            </div>
            <div className="text-xl font-bold text-white">
              {digest.hasCheckInToday ? `${digest.todayScore} / 100` : "Check-in Pending"}
            </div>
          </div>

          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Top Habit Pillar */}
        <div className="bg-zinc-950/60 border border-zinc-800/60 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Top Habit Streak
            </div>
            <div className="text-xl font-bold text-white truncate max-w-[140px]">
              {digest.topHabitTitle ? `${digest.topHabitStreak}d Streak` : "No Habits"}
            </div>
          </div>

          <Link
            href="/habits"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Primary Goal Pillar */}
        <div className="bg-zinc-950/60 border border-zinc-800/60 p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              Primary Goal
            </div>
            <div className="text-xl font-bold text-white truncate max-w-[140px]">
              {digest.topGoalTitle ? `${digest.topGoalProgress}% Done` : "Set a Goal"}
            </div>
          </div>

          <Link
            href="/goals"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Daily Wisdom Footer */}
      <div className="pt-2 text-xs italic text-zinc-400 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
        <span>&quot;{digest.dailyWisdom}&quot;</span>
      </div>
    </div>
  );
}
