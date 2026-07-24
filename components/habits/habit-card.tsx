"use client";

import { useState, useTransition, useEffect, type ComponentType } from "react";
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
  Clock,
  Play,
  Pause,
  RotateCcw,
  Timer,
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
  const [customInputValue, setCustomInputValue] = useState<string>("");

  // Live Habit Timer State
  const [showLiveTimer, setShowLiveTimer] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishTimer = () => {
    setIsTimerRunning(false);
    setShowLiveTimer(false);
    const elapsedMins = Math.max(1, Math.round(timerSeconds / 60));
    let loggedAmount = elapsedMins;
    if (habit.unit?.toLowerCase().includes("hour") || habit.unit?.toLowerCase().includes("hr")) {
      loggedAmount = Math.max(0.1, parseFloat((timerSeconds / 3600).toFixed(1)));
    }
    handleSetExactValue(currentLoggedValue + loggedAmount);
    setTimerSeconds(0);
  };

  // Compute stats dynamically
  const stats = calculateHabitStats(habit);
  
  const todayStr = formatDateLocal(new Date());
  const todayLog = habit.logs.find((l) => formatDateLocal(new Date(l.date)) === todayStr);
  const targetValue = habit.targetValue || 1;

  const currentLoggedValue = todayLog?.value ?? (todayLog?.status ? targetValue : 0);
  const isCompletedToday = stats.weeklyHistory.find((h) => h.dateStr === todayStr)?.status === "completed";

  const config = categoryConfig[habit.category] || categoryConfig.General;
  const CategoryIcon = config.icon;

  const isTimeBased =
    habit.unit?.toLowerCase().includes("min") ||
    habit.unit?.toLowerCase().includes("hour") ||
    habit.unit?.toLowerCase().includes("hr") ||
    habit.category === "Study" ||
    habit.category === "Reading";

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

  const handleSetExactValue = (val: number) => {
    startTransition(async () => {
      const res = await updateHabitLogValue(habit.id, todayStr, val);
      if (res.success) {
        if (res.isCompleted && val >= targetValue) {
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

  const handleSaveCustomValue = () => {
    const num = parseFloat(customInputValue);
    if (!isNaN(num) && num >= 0) {
      handleSetExactValue(num);
      setCustomInputValue("");
    }
  };

  const handleStepValue = (delta: number) => {
    const nextValue = Math.max(0, Math.min(targetValue * 2, currentLoggedValue + delta));
    handleSetExactValue(nextValue);
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
    <div className="precision-card relative group overflow-hidden rounded-2xl p-5 transition-all duration-200">
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
                ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105"
                : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500/50 bg-zinc-100 dark:bg-zinc-950/40"
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
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}>
                <CategoryIcon className="h-3 w-3" />
                {habit.category}
              </span>

              {stats.currentStreak > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Flame className="h-3 w-3 text-amber-500" />
                  {stats.currentStreak}d streak
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
            className="precision-btn p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            {habit.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            title="Delete Habit"
            className="precision-btn p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Custom Value/Duration Logging Bar */}
      <div className="precision-well mt-4 space-y-2.5 p-3.5 rounded-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Logged Today</span>
          </span>
          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {currentLoggedValue} / {targetValue} {habit.unit || "times"}
          </span>
        </div>

        {/* Stepper + Custom Value Input */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Stepper Buttons & Progress Bar */}
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <button
              onClick={() => handleStepValue(-1)}
              disabled={isPending || currentLoggedValue <= 0}
              className="precision-btn flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold disabled:opacity-30 transition-colors"
              title="Decrease count"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <div className="precision-well flex-1 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-500 dark:to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentLoggedValue / targetValue) * 100)}%` }}
              />
            </div>

            <button
              onClick={() => handleStepValue(1)}
              disabled={isPending}
              className="precision-btn flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold disabled:opacity-40 transition-colors"
              title="Increase count"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Direct Custom Time/Numeric Input */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step="any"
              min="0"
              placeholder={currentLoggedValue.toString()}
              value={customInputValue}
              onChange={(e) => setCustomInputValue(e.target.value)}
              className="w-16 px-2 py-1 text-center text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="button"
              onClick={handleSaveCustomValue}
              disabled={isPending || !customInputValue.trim()}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-40"
            >
              Log
            </button>
          </div>
        </div>

        {/* Quick Time Presets & Live Stopwatch */}
        <div className="space-y-2 pt-1 border-t border-zinc-800/40">
          {isTimeBased && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-zinc-500 font-semibold">Quick Log:</span>
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetExactValue(mins)}
                  disabled={isPending}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-indigo-600/20 hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
                >
                  +{mins}m
                </button>
              ))}
            </div>
          )}

          {/* Live Habit Timer Controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {!showLiveTimer ? (
              <button
                type="button"
                onClick={() => {
                  setShowLiveTimer(true);
                  setIsTimerRunning(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <Timer className="h-3.5 w-3.5 text-indigo-400" />
                <span>▶ Start Live Habit Timer</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-zinc-950/90 p-3 rounded-xl border border-indigo-500/30 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Timer className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Live Habit Stopwatch</div>
                    <div className="text-lg font-black font-mono text-indigo-300 tracking-wider">
                      {formatTimer(timerSeconds)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning((prev) => !prev)}
                    className="p-2 rounded-lg bg-indigo-600/30 border border-indigo-500 text-indigo-200 hover:bg-indigo-600 hover:text-white transition-all"
                    title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
                  >
                    {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimerSeconds(0)}
                    className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
                    title="Reset Timer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishTimer}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Finish & Log Time</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                      : status === "partial"
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm"
                      : status === "missed"
                      ? isToday
                        ? "bg-transparent border-zinc-700 text-transparent"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400/70"
                      : "bg-transparent border-zinc-800/40 text-transparent"
                  }`}
                  title={`${day.dateStr}: ${status === "partial" ? `${day.percent}% Partial Logged (${day.loggedValue}/${day.targetValue})` : status}`}
                >
                  {status === "completed" && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  {status === "partial" && <span className="text-[9px] font-bold text-amber-300 font-mono">{day.percent}%</span>}
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
