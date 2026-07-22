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
  Trash2,
  Plus,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Target,
  ClipboardList,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  updateGoalProgress,
  toggleMilestone,
  addMilestone,
  deleteMilestone,
  deleteGoal,
} from "@/lib/actions/goal";

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalWithMilestones {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  timeframe: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  completed: boolean;
  targetDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  milestones: Milestone[];
}

interface GoalCardProps {
  goal: GoalWithMilestones;
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

export function GoalCard({ goal, onRefresh }: GoalCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isMilestonesExpanded, setIsMilestonesExpanded] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Milestone inline editing states
  const [newMilestoneText, setNewMilestoneText] = useState("");
  const [customProgressInput, setCustomProgressInput] = useState<number | "">(goal.currentValue);

  const config = categoryConfig[goal.category] || categoryConfig.General;
  const CategoryIcon = config.icon;

  // Calculators
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const totalMilestones = goal.milestones.length;
  const milestonesPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const numericalPercent = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
  const clampedNumericalPercent = Math.min(100, Math.max(0, numericalPercent));

  // Determine deadline status
  let deadlineBadge = null;
  let deadlineClass = "text-zinc-500 bg-zinc-950/40 border-zinc-800/80";

  if (goal.targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(goal.targetDate);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      deadlineBadge = `Overdue by ${Math.abs(diffDays)}d ⚠️`;
      deadlineClass = "text-rose-400 bg-rose-500/10 border-rose-500/25";
    } else if (diffDays === 0) {
      deadlineBadge = "Deadline Today ⏱️";
      deadlineClass = "text-amber-400 bg-amber-500/10 border-amber-500/25 animate-pulse";
    } else if (diffDays <= 7) {
      deadlineBadge = `${diffDays} days left ⏳`;
      deadlineClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else {
      deadlineBadge = `${diffDays} days left`;
      deadlineClass = "text-zinc-400 bg-zinc-950/40 border-zinc-800/80";
    }
  }

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#8b5cf6", "#6366f1", "#a855f7", "#10b981"],
    });
  };

  const handleUpdateProgress = (value: number) => {
    startTransition(async () => {
      const res = await updateGoalProgress(goal.id, value);
      if (res.success) {
        if (res.goal && res.goal.completed && !goal.completed) {
          triggerConfetti();
        }
        if (onRefresh) onRefresh();
      }
    });
  };

  const handleProgressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setCustomProgressInput("");
    } else {
      setCustomProgressInput(parseFloat(val) || 0);
    }
  };

  const handleSaveProgressInput = () => {
    if (customProgressInput !== "") {
      handleUpdateProgress(customProgressInput);
    }
  };

  const handleToggleMilestone = (milestoneId: string) => {
    startTransition(async () => {
      const res = await toggleMilestone(milestoneId);
      if (res.success) {
        // Check if this action completed the overall goal (if all milestones are checked and numerical target matches)
        const willCompletedCount = goal.milestones.reduce((acc, m) => {
          if (m.id === milestoneId) return m.completed ? acc - 1 : acc + 1;
          return m.completed ? acc + 1 : acc;
        }, 0);

        const allMilestonesCompleted = willCompletedCount === totalMilestones;
        const numericalGoalCompleted = goal.currentValue >= goal.targetValue;

        if (allMilestonesCompleted && numericalGoalCompleted && !goal.completed) {
          triggerConfetti();
        }

        if (onRefresh) onRefresh();
      }
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;

    startTransition(async () => {
      const res = await addMilestone(goal.id, newMilestoneText);
      if (res.success) {
        setNewMilestoneText("");
        if (onRefresh) onRefresh();
      }
    });
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    startTransition(async () => {
      const res = await deleteMilestone(milestoneId);
      if (res.success && onRefresh) onRefresh();
    });
  };

  const handleDeleteGoal = () => {
    startTransition(async () => {
      const res = await deleteGoal(goal.id);
      if (res.success && onRefresh) onRefresh();
    });
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all duration-300">
      {/* Background Accent glow */}
      <div className={`absolute top-0 right-0 -mt-16 -mr-16 h-36 w-36 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl pointer-events-none ${config.bg.replace('/10', '/30')}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
              <CategoryIcon className="h-3 w-3" />
              {goal.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-850/50 border border-zinc-800 text-zinc-400">
              <Calendar className="h-3 w-3" />
              {goal.timeframe.charAt(0) + goal.timeframe.slice(1).toLowerCase()}
            </span>
            {deadlineBadge && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${deadlineClass}`}>
                {deadlineBadge}
              </span>
            )}
          </div>

          <h3 className={`text-base font-bold tracking-tight text-white mt-1.5 transition-all ${goal.completed ? "line-through text-zinc-500" : ""}`}>
            {goal.title}
          </h3>

          {goal.description && (
            <p className="text-xs text-zinc-400 leading-normal max-w-sm mt-1">
              {goal.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setShowConfirmDelete(true)}
            title="Delete Goal"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/80 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-5 space-y-4">
        {/* Numerical Target Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-zinc-400 flex items-center gap-1">
              <Target className="h-3.5 w-3.5 text-purple-400" />
              Numerical Target
            </span>
            <span className="font-bold text-white">
              {goal.currentValue} / {goal.targetValue} {goal.unit || "%"}
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/40">
            <div
              className={`h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-full transition-all duration-500 ${
                goal.completed ? "from-emerald-500 to-teal-500" : ""
              }`}
              style={{ width: `${clampedNumericalPercent}%` }}
            />
          </div>

          {/* Quick Increment buttons */}
          <div className="flex items-center justify-between gap-2 pt-1.5">
            <div className="flex items-center gap-1 bg-zinc-950/40 rounded-lg p-0.5 border border-zinc-850">
              <button
                type="button"
                onClick={() => handleUpdateProgress(goal.currentValue - 1)}
                disabled={isPending}
                className="px-2 py-0.5 text-xs font-bold text-zinc-500 hover:text-white disabled:opacity-50"
              >
                -
              </button>
              <span className="text-[10px] px-1 text-zinc-400 font-medium">1 unit</span>
              <button
                type="button"
                onClick={() => handleUpdateProgress(goal.currentValue + 1)}
                disabled={isPending}
                className="px-2 py-0.5 text-xs font-bold text-zinc-500 hover:text-white disabled:opacity-50"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="any"
                value={customProgressInput}
                onChange={handleProgressInputChange}
                className="w-14 px-2 py-0.5 text-center text-xs rounded bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveProgressInput}
                disabled={isPending || customProgressInput === ""}
                className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        {/* Milestones Checklist Section */}
        {totalMilestones > 0 && (
          <div className="border-t border-zinc-850 pt-3 space-y-2">
            <button
              onClick={() => setIsMilestonesExpanded(!isMilestonesExpanded)}
              className="flex items-center justify-between w-full text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1">
                <ClipboardList className="h-3.5 w-3.5 text-indigo-400" />
                Milestone Tasks ({completedMilestones} / {totalMilestones})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 font-bold">
                  {Math.round(milestonesPercent)}% complete
                </span>
                {isMilestonesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {isMilestonesExpanded && (
              <div className="space-y-1.5 pl-1.5 pt-1 animate-fadeIn">
                {goal.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 group/milestone py-0.5">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-zinc-300 hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => handleToggleMilestone(m.id)}
                        disabled={isPending}
                        className="mt-0.5 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                      />
                      <span className={m.completed ? "line-through text-zinc-500" : ""}>
                        {m.title}
                      </span>
                    </label>
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      disabled={isPending}
                      className="opacity-0 group-hover/milestone:opacity-100 p-1 text-zinc-600 hover:text-rose-400 rounded transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Inline Milestone Creation form */}
                <form onSubmit={handleAddMilestone} className="flex items-center gap-1.5 pt-1.5">
                  <input
                    type="text"
                    placeholder="Add task milestone..."
                    value={newMilestoneText}
                    onChange={(e) => setNewMilestoneText(e.target.value)}
                    className="flex-1 px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !newMilestoneText.trim()}
                    className="p-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-50 flex items-center justify-center h-6 w-6"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-zinc-950/95 rounded-2xl border border-rose-900/30 text-center animate-fadeIn">
          <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
          <h4 className="text-sm font-bold text-white">Delete Goal?</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs px-2">
            This will permanently delete &quot;{goal.title}&quot; and all of its associated milestone tasks.
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
                handleDeleteGoal();
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
