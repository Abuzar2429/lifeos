"use client";

import { useState, useTransition } from "react";
import {
  X,
  Sparkles,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Briefcase,
  BookOpen,
  Compass,
  Flame,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { createGoal } from "@/lib/actions/goal";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categories = [
  { name: "Fitness", icon: Dumbbell, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  { name: "Study", icon: GraduationCap, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { name: "Health", icon: HeartPulse, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { name: "Career", icon: Briefcase, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { name: "Reading", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { name: "Mindfulness", icon: Compass, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { name: "General", icon: Flame, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
];

export function GoalModal({ isOpen, onClose, onSuccess }: GoalModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [timeframe, setTimeframe] = useState("MONTHLY");
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState("%");
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<string[]>([""]);

  if (!isOpen) return null;

  const handleAddMilestoneField = () => {
    setMilestones((prev) => [...prev, ""]);
  };

  const handleRemoveMilestoneField = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, value: string) => {
    setMilestones((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a goal title.");
      return;
    }

    setError(null);
    startTransition(async () => {
      // Filter out empty milestones
      const activeMilestones = milestones.filter((m) => m.trim() !== "");

      const res = await createGoal({
        title,
        description,
        category,
        timeframe,
        targetValue,
        unit,
        targetDate: targetDate || undefined,
        milestones: activeMilestones,
      });

      if (res.success) {
        setTitle("");
        setDescription("");
        setCategory("General");
        setTimeframe("MONTHLY");
        setTargetValue(100);
        setUnit("%");
        setTargetDate("");
        setMilestones([""]);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to create goal.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/80 overflow-hidden text-zinc-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Objective Goal</h3>
              <p className="text-xs text-zinc-400">Set high level objectives and map milestones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="goal-title" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Goal Objective
            </label>
            <input
              id="goal-title"
              type="text"
              placeholder="e.g. Complete Advanced React Course, Run Half-Marathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="goal-desc" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              id="goal-desc"
              rows={2}
              placeholder="Why is this objective important and what is your focus?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? `${cat.bg} ${cat.color} scale-105 border-zinc-600`
                        : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeframe & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="goal-timeframe" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Timeframe
              </label>
              <select
                id="goal-timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="goal-deadline" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Target Date / Deadline
              </label>
              <input
                id="goal-deadline"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Target Value Configs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="goal-target" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Target Numerical Goal
              </label>
              <input
                id="goal-target"
                type="number"
                step="any"
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="goal-unit" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Progress Unit
              </label>
              <input
                id="goal-unit"
                type="text"
                placeholder="%, books, km, etc."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Milestones Checklist Builder */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Milestones Checklist
              </label>
              <button
                type="button"
                onClick={handleAddMilestoneField}
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-2">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-600 w-5 flex-none text-right">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Set up repository, Write first chapter draft"
                    value={milestone}
                    onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestoneField(idx)}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Create Goal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
