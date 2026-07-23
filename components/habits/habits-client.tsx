"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  CheckSquare,
  Flame,
  Trophy,
  Archive,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitModal } from "@/components/habits/habit-modal";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import type { HeatmapDay } from "@/lib/actions/heatmap";
import { type HabitWithLogs, calculateHabitStats, formatDateLocal } from "@/lib/utils/habit-streaks";

interface SerializedHabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completedAt: string;
  status: boolean;
  notes: string | null;
}

interface SerializedHabit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  frequency: string;
  customDays: string | null;
  targetValue: number;
  unit: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  logs: SerializedHabitLog[];
}

interface HabitsClientProps {
  initialHabits: SerializedHabit[];
  heatmapDays?: HeatmapDay[];
}

const categories = ["All", "Fitness", "Study", "Health", "Career", "Reading", "Mindfulness", "General"];

export function HabitsClient({ initialHabits, heatmapDays = [] }: HabitsClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert serialized string dates back to Date objects
  const habits: HabitWithLogs[] = initialHabits.map((h) => ({
    ...h,
    createdAt: new Date(h.createdAt),
    updatedAt: new Date(h.updatedAt),
    logs: h.logs.map((l: SerializedHabitLog) => ({
      ...l,
      date: new Date(l.date),
      completedAt: new Date(l.completedAt),
    })),
  }));

  // Quick refresh helper that triggers Next.js page revalidation
  const refreshData = () => {
    router.refresh();
  };

  const todayStr = formatDateLocal(new Date());

  // Calculate statistics across active habits
  const activeHabits = habits.filter((h) => !h.archived);
  const archivedHabits = habits.filter((h) => h.archived);

  const completedTodayCount = activeHabits.reduce((acc, habit) => {
    const stats = calculateHabitStats(habit);
    const completedToday = stats.weeklyHistory.find((h) => h.dateStr === todayStr)?.status === "completed";
    return completedToday ? acc + 1 : acc;
  }, 0);

  const maxStreak = activeHabits.reduce((max, habit) => {
    const stats = calculateHabitStats(habit);
    return stats.currentStreak > max ? stats.currentStreak : max;
  }, 0);

  const avgCompletionRate = activeHabits.length
    ? Math.round(
        activeHabits.reduce((sum, habit) => sum + calculateHabitStats(habit).completionRate, 0) /
          activeHabits.length
      )
    : 0;

  // Filter habits for current view
  const currentHabits = (showArchived ? archivedHabits : activeHabits).filter((habit) => {
    const matchesCategory = selectedCategory === "All" || habit.category === selectedCategory;
    const matchesSearch =
      habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppShell>
      {/* Page Header banner */}
      <div className="neo-glass relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              Habit & Fitness Routine Tracker
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
              Build lasting discipline by tracking daily routines, setting target counts, and watching your streaks grow.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="neo-button flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:scale-105 transition-all"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Habits"
          value={`${activeHabits.length}`}
          subtitle="Active routines"
          icon={CheckSquare}
          gradient="from-indigo-600/15 via-indigo-900/5 to-transparent"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />

        <MetricCard
          title="Completed Today"
          value={activeHabits.length ? `${completedTodayCount}/${activeHabits.length}` : "--"}
          subtitle="Daily progress"
          icon={CheckSquare}
          gradient="from-emerald-600/15 via-emerald-900/5 to-transparent"
          iconColor="text-emerald-600 dark:text-emerald-400"
          badge={
            activeHabits.length > 0 && completedTodayCount === activeHabits.length
              ? "All Done! 🎉"
              : undefined
          }
          badgeColor="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
        />

        <MetricCard
          title="Best Streak"
          value={maxStreak > 0 ? `${maxStreak} days` : "--"}
          subtitle="Consistent streak"
          icon={Flame}
          gradient="from-amber-600/15 via-amber-900/5 to-transparent"
          iconColor="text-amber-600 dark:text-amber-400"
          badge={maxStreak > 0 ? "🔥 Hot" : undefined}
          badgeColor="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
        />

        <MetricCard
          title="Avg Completion"
          value={activeHabits.length ? `${avgCompletionRate}%` : "--"}
          subtitle="Overall success rate"
          icon={Trophy}
          gradient="from-violet-600/15 via-violet-900/5 to-transparent"
          iconColor="text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* 365-Day Activity Heatmap */}
      {heatmapDays.length > 0 && <ActivityHeatmap days={heatmapDays} />}

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800/50 pt-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "neo-button text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Archives Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neo-inset w-full pl-9 pr-4 py-2 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`neo-button flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              showArchived
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>{showArchived ? "Active" : `Archived (${archivedHabits.length})`}</span>
          </button>
        </div>
      </div>

      {/* Habit Cards Grid */}
      {currentHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onRefresh={refreshData} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/10 backdrop-blur-sm">
          <CheckSquare className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-white">No habits found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
            {searchQuery || selectedCategory !== "All"
              ? "Try adjusting your filters or search terms."
              : showArchived
              ? "You don't have any archived habits."
              : "Get started by adding your first habit routine!"}
          </p>
          {!searchQuery && selectedCategory === "All" && !showArchived && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              Add Your First Habit
            </button>
          )}
        </div>
      )}

      {/* Creation Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
      />
    </AppShell>
  );
}
