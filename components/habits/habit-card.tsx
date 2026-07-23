"use client";

import { useState, useTransition, type ComponentType } from "react";
import {
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Briefcase,
  BookOpen,
  Compass,
  Flame,
  Archive,
  ArchiveRestore,
  Trash2,
  Check,
  Calendar,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import confetti from "canvas-confetti";
import { toggleHabitLog, updateHabitLogValue, archiveHabit, unarchiveHabit, deleteHabit } from "@/lib/actions/habit";
import { calculateHabitStats, type HabitWithLogs, formatDateLocal } from "@/lib/utils/habit-streaks";

interface HabitCardProps {
  habit: HabitWithLogs;
  onRefresh?: () => void;
}

const categoryConfig: Record<string, { icon: ComponentType<{ className?: string }>; color: string; bg: string; text: string; border: string }> = {
  Fitness: { icon: Dumbbell, color: "text-rose-400", bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/20" },
  Study: { icon: GraduationCap, color: "text-violet-400", bg: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-500/20" },
  Health: { icon: HeartPulse, color: "text-cyan-400", bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/20" },
  Career: { icon: Briefcase, color: "text-amber-400", bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/20" },
  Reading: { icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" },
  Mindfulness: { icon: Compass, color: "text-indigo-400", bg: "bg-indigo-500/10", text: "text-indigo-300", border: "border-indigo-500/20" },
  General: { icon: Flame, color: "text-zinc-400", bg: "bg-zinc-500/10", text: "text-zinc-300", border: "border-zinc-500/20" },
};

export function HabitCard({ habit, onRefresh }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Compute stats dynamically
  const stats = calculateHabitStats(habit);
  
  const todayStr = formatDateLocal(new Date());
  const todayLog = habit.logs.find((l) => formatDateLocal(new Date(l.date)) === todayStr);
  const targetValue = habit.targetValue || 1;
  const isMultiCount = targetValue > 1;

  const currentLoggedValue = todayLog?.value ?? (todayLog?.status ? targetValue : 0);
  const isCompletedToday = stats.weeklyHistory.find((h) => h.dateStr === todayStr)?.status === "completed";

  const config = categoryConfig[habit.category] || categoryConfig.General;
  const CategoryIcon = config.icon;

  const handleToggleToday = () => {
    startTransition(async () => {
      const res = await toggleHabitLog(habit.id, todayStr);
      if (res.success) {
        if (res.action === "created") {
          // Spark confetti!
          confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 },
            colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#3b82f6"],
          });
        }
        if (onRefresh) onRefresh();
      }
    });
  };

  const handleStepValue = (delta: number) => {
    const nextValue = Math.max(0, Math.min(targetValue * 2, currentLoggedValue + delta));
    startTransition(async () => {
      const res = await updateHabitLogValue(habit.id, todayStr, nextValue);
      if (res.success) {
        if (res.isCompleted && nextValue >= targetValue) {
          confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 },
            colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#3b82f6"],
          });
        }
        if (onRefresh) onRefresh();
      }
    });
  };

  const handleTogglePastDay = (dateStr: string) => {
    startTransition(async () => {
      const res = await toggleHabitLog(habit.id, dateStr);
      if (res.success) {
        if (res.action === "created" && dateStr === todayStr) {
          confetti({
            particleCount: 80,
            spread: 50,
            origin: { y: 0.8 },
          });
        }
        if (onRefresh) onRefresh();
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const res = habit.archived ? await unarchiveHabit(habit.id) : await archiveHabit(habit.id);
      if (res.success && onRefresh) onRefresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteHabit(habit.id);
      if (res.success && onRefresh) onRefresh();
    });
  };

  return (
    <div className="neo-glass-card relative group overflow-hidden rounded-2xl p-5 transition-all duration-300">
      {/* Background Accent glow */}
      <div className={`absolute top-0 right-0 -mt-16 -mr-16 h-36 w-36 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl pointer-events-none ${config.bg.replace('/10', '/30')}`} />

      <div className="flex items-start justify-between gap-4">
        {/* Left Side: Completion Toggle & Title */}
        <div className="flex items-start gap-3.5">
          {/* Completion Check Ring */}
          <button
            onClick={handleToggleToday}
            disabled={isPending}
            className={`mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full border transition-all ${
              isCompletedToday
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105"
                : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-500/50 bg-zinc-100 dark:bg-zinc-950/40"
            } disabled:opacity-50`}
          >
            {isCompletedToday ? (
              <Check className="h-4 w-4 stroke-[3]" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-transparent group-hover/toggle:bg-zinc-800 transition-colors" />
            )}
          </button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                <CategoryIcon className="h-3 w-3" />
                {habit.category}
              </span>

              {stats.currentStreak > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Flame className="h-3 w-3 animate-pulse" />
                  {stats.currentStreak} day streak
                </span>
              )}
            </div>

            <h3 className={`text-base font-bold tracking-tight text-zinc-900 dark:text-white transition-all ${isCompletedToday ? "line-through text-zinc-400 dark:text-zinc-500" : ""}`}>
              {habit.title}
            </h3>

            {habit.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-sm">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Options (Archive & Delete) */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleArchive}
            title={habit.archived ? "Restore Habit" : "Archive Habit"}
            className="neo-button p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            {habit.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            title="Delete Habit"
            className="neo-button p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-Count Progress Stepper Bar */}
      {isMultiCount && (
        <div className="neo-inset mt-4 space-y-2 p-3 rounded-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Daily Progress</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {currentLoggedValue} / {targetValue} {habit.unit || "times"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStepValue(-1)}
              disabled={isPending || currentLoggedValue <= 0}
              className="neo-button flex h-7 w-7 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-300 text-xs font-bold disabled:opacity-30 transition-colors"
              title="Decrease count"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="neo-inset flex-1 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentLoggedValue / targetValue) * 100)}%` }}
              />
            </div>
            <button
              onClick={() => handleStepValue(1)}
              disabled={isPending}
              className="neo-button flex h-7 w-7 items-center justify-center rounded-lg text-indigo-600 dark:text-indigo-300 text-xs font-bold disabled:opacity-40 transition-colors"
              title="Increase count"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Target details */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-200 dark:border-zinc-800/50 pt-3">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {habit.frequency === "DAILY" && "Every day"}
            {habit.frequency === "WEEKDAYS" && "Weekdays"}
            {habit.frequency === "CUSTOM" && "Custom frequency"}
          </span>
        </div>
        <div>
          Goal: <span className="font-semibold text-zinc-400">{habit.targetValue} {habit.unit || "times"}</span>
        </div>
      </div>

      {/* 7-Day History Mini-Row */}
      <div className="mt-4 bg-zinc-950/30 rounded-xl border border-zinc-800/50 p-2.5">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex justify-between px-1">
          <span>Weekly History</span>
          <span className="text-indigo-400 font-bold">{stats.completionRate}% completion</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {stats.weeklyHistory.map((day) => {
            const isToday = day.dateStr === todayStr;
            const status = day.status;

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => handleTogglePastDay(day.dateStr)}
                disabled={isPending}
                className="flex flex-col items-center gap-1 py-1 rounded-lg hover:bg-zinc-800/40 transition-colors group/day"
              >
                <span className={`text-[9px] font-medium ${isToday ? "text-indigo-400 font-bold" : "text-zinc-500"}`}>
                  {day.dayName}
                </span>
                <div
                  className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                    status === "completed"
                      ? "bg-indigo-600/20 border-indigo-500/60 text-indigo-300"
                      : status === "missed"
                      ? isToday
                        ? "bg-transparent border-zinc-700 text-transparent"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400/70"
                      : "bg-transparent border-zinc-800/40 text-transparent"
                  }`}
                  title={`${day.dateStr}: ${status}`}
                >
                  {status === "completed" && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  {status === "missed" && !isToday && <span className="text-[8px] font-bold">×</span>}
                  {status === "not-scheduled" && <span className="h-1 w-1 rounded-full bg-zinc-800" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-zinc-950/95 rounded-2xl border border-rose-900/30 text-center animate-fadeIn">
          <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
          <h4 className="text-sm font-bold text-white">Delete Habit?</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs px-2">
            This will permanently erase all history for &quot;{habit.title}&quot;.
          </p>
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowConfirmDelete(false);
                handleDelete();
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
