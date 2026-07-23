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
  Heart,
  Zap,
  ShieldCheck,
  Download,
  Star,
  Quote,
  Flame,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendWidget, CheckInHistoryItem } from "@/components/dashboard/trend-widget";
import { DailyDigestWidget } from "@/components/dashboard/daily-digest-widget";
import { HydrationWidget } from "@/components/dashboard/hydration-widget";
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
    if (score === null) return { label: "Not Logged", color: "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700" };
    if (score >= 85) return { label: "Peak State 🌿", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" };
    if (score >= 70) return { label: "High Flow ✨", color: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30" };
    if (score >= 50) return { label: "Steady Pace 🍵", color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" };
    return { label: "Needs Recovery 🔋", color: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30" };
  };

  const status = getScoreStatus(todayScore);

  return (
    <AppShell todayCheckIn={todayCheckIn} todayScore={todayScore}>
      {/* 1. Calming Executive Daily Digest Banner */}
      <DailyDigestWidget digest={digest} />

      {/* 2. Soft Neumorphic Hydration Tracker */}
      <HydrationWidget currentGlasses={todayCheckIn?.waterGlasses ?? 0} />

      {/* 3. Calming Health & Wellness Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Daily Score"
          value={todayScore !== null ? `${todayScore}` : "--"}
          subtitle="Overall wellness balance"
          icon={Activity}
          gradient="from-indigo-500/10 via-purple-500/5 to-transparent"
          iconColor="text-indigo-600 dark:text-indigo-400"
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
          subtitle="Emotional harmony"
          icon={Smile}
          gradient="from-emerald-500/10 via-teal-500/5 to-transparent"
          iconColor="text-emerald-600 dark:text-emerald-400"
          badge={todayCheckIn ? "Logged" : "Pending"}
          badgeColor={
            todayCheckIn
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
          }
        />

        <MetricCard
          title="Rest & Hydration"
          value={
            todayCheckIn
              ? `${todayCheckIn.sleepHours}h sleep • ${todayCheckIn.waterGlasses} glasses`
              : "--"
          }
          subtitle="Recovery & Hydration"
          icon={Moon}
          gradient="from-cyan-500/10 via-blue-500/5 to-transparent"
          iconColor="text-cyan-600 dark:text-cyan-400"
          badge={todayCheckIn?.waterGlasses ? `${todayCheckIn.waterGlasses}/8 Glasses` : undefined}
          badgeColor="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
        />

        <MetricCard
          title="Fitness & Focus"
          value={
            todayCheckIn
              ? `${todayCheckIn.studyHours}h study • ${todayCheckIn.workoutMins}m workout`
              : "--"
          }
          subtitle="Active movement & study"
          icon={GraduationCap}
          gradient="from-violet-500/10 via-purple-500/5 to-transparent"
          iconColor="text-violet-600 dark:text-violet-400"
          badge={todayCheckIn?.workoutMins ? `${todayCheckIn.workoutMins}m active` : undefined}
          badgeColor="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
        />
      </div>

      {/* 4. 7-Day Performance Trend Chart & Reflections */}
      <TrendWidget history={history} />

      {/* 5. Calming Feature Showcase Section (Connected to Live Backend) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
              <span>Wellness & Productivity Hub</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Track habits, milestone goals, and mindful daily reflections in real-time
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Habit & Streak Feature Showcase */}
          <Link
            href="/habits"
            className="neo-glass-card group rounded-2xl p-6 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="neo-button p-3 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <CheckSquare className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-4">
              Habit & Fitness Streaks
            </h3>
            {totalHabitsCount > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Today&apos;s Progress</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {completedHabitsCount}/{totalHabitsCount} done
                  </span>
                </div>
                <div className="neo-inset h-2 w-full rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-500 dark:to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(completedHabitsCount / totalHabitsCount) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Build sustainable daily habits with interactive stepper counts and streak celebration.
              </p>
            )}
          </Link>

          {/* Goal Milestone Feature Showcase */}
          <Link
            href="/goals"
            className="neo-glass-card group rounded-2xl p-6 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="neo-button p-3 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-4">
              Milestone Goal Execution
            </h3>
            {activeGoalsCount > 0 ? (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Active Objectives</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {activeGoalsCount} active {totalActiveMilestones > 0 && `• ${completedActiveMilestones}/${totalActiveMilestones} tasks`}
                  </span>
                </div>
                {totalActiveMilestones > 0 && (
                  <div className="neo-inset h-2 w-full rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${(completedActiveMilestones / totalActiveMilestones) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Break large life objectives into structured sub-milestones with live progress tracking.
              </p>
            )}
          </Link>

          {/* Smart Journaling Feature Showcase */}
          <Link
            href="/journal"
            className="neo-glass-card group rounded-2xl p-6 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="neo-button p-3 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-4">
              Mindful Smart Journal
            </h3>
            {latestJournalTitle ? (
              <div className="mt-3 space-y-1">
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
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[185px]">
                    {latestJournalTitle}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 italic">
                  &ldquo;{latestJournalSnippet}&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Reflect with automatic sentiment analysis, hashtag extraction, and mood telemetry.
              </p>
            )}
          </Link>
        </div>
      </div>

      {/* 6. Soft Calming Testimonials & Mindful Reflections */}
      <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Quote className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Mindful Reflections & Community Praise</span>
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>4.9 / 5 Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="neo-glass p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
              &quot;The quick hydration tracker and wellness score changed my daily routine completely. Tracking 8 glasses of water throughout the day keeps me energized.&quot;
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                DR
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Dr. Rebecca Vance</div>
                <div className="text-[10px] text-zinc-400">Mindfulness & Sleep Coach</div>
              </div>
            </div>
          </div>

          <div className="neo-glass p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
              &quot;Sub-milestones for my fitness goals make large targets approachable. Achieving 5 habit reps a day with single-click steppers is so satisfying!&quot;
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                MK
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Marcus Chen</div>
                <div className="text-[10px] text-zinc-400">Triathlete & Software Engineer</div>
              </div>
            </div>
          </div>

          <div className="neo-glass p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
              &quot;AI Coach reflections and mood sentiment tags give me real clarity on my stress levels before going to bed. LifeOS is my favorite daily companion.&quot;
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-7 w-7 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">
                SL
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Sophia Laurent</div>
                <div className="text-[10px] text-zinc-400">Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Soft Neumorphic App Download & Quick Action CTA Banner */}
      <div className="neo-glass relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>100% Local & Private Telemetry</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Take Control of Your Daily Wellness Flow
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            All your habits, goals, journals, and health scores are synced in real-time. Use Cmd+K anytime to launch instant search or check in below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/ai"
            className="neo-button inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-300 transition-all hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            <span>Chat with AI Coach</span>
          </Link>
          <Link
            href="/settings"
            className="neo-button inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:scale-105"
          >
            <Download className="h-4 w-4" />
            <span>Export Data JSON</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
