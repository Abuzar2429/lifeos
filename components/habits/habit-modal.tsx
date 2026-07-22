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
  Check,
} from "lucide-react";
import { createHabit } from "@/lib/actions/habit";

interface HabitModalProps {
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

const weekdayOptions = [
  { label: "Mon", value: "Monday" },
  { label: "Tue", value: "Tuesday" },
  { label: "Wed", value: "Wednesday" },
  { label: "Thu", value: "Thursday" },
  { label: "Fri", value: "Friday" },
  { label: "Sat", value: "Saturday" },
  { label: "Sun", value: "Sunday" },
];

export function HabitModal({ isOpen, onClose, onSuccess }: HabitModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [frequency, setFrequency] = useState("DAILY");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState("times");

  if (!isOpen) return null;

  const handleDayToggle = (day: string) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a habit title.");
      return;
    }

    if (frequency === "CUSTOM" && customDays.length === 0) {
      setError("Please select at least one day for custom frequency.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await createHabit({
        title,
        description,
        category,
        frequency,
        customDays: frequency === "CUSTOM" ? customDays : undefined,
        targetValue,
        unit,
      });

      if (res.success) {
        // Reset form
        setTitle("");
        setDescription("");
        setCategory("General");
        setFrequency("DAILY");
        setCustomDays([]);
        setTargetValue(1);
        setUnit("times");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to create habit.");
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
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New Habit</h3>
              <p className="text-xs text-zinc-400">Design a routine for positive consistency</p>
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
            <label htmlFor="habit-title" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Habit Name
            </label>
            <input
              id="habit-title"
              type="text"
              placeholder="e.g. Morning Meditation, Read 10 Pages"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="habit-desc" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              id="habit-desc"
              rows={2}
              placeholder="What details help you stick to this habit?"
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

          {/* Frequency Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="habit-freq" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Frequency
              </label>
              <select
                id="habit-freq"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="DAILY">Every Day</option>
                <option value="WEEKDAYS">Weekdays (Mon-Fri)</option>
                <option value="CUSTOM">Custom Days</option>
              </select>
            </div>

            {/* Target Goals */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label htmlFor="habit-target" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Target
                </label>
                <input
                  id="habit-target"
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="habit-unit" className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Unit
                </label>
                <input
                  id="habit-unit"
                  type="text"
                  placeholder="times"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Custom Days Selection */}
          {frequency === "CUSTOM" && (
            <div className="space-y-2 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 transition-all animate-fadeIn">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Select Custom Days
              </span>
              <div className="grid grid-cols-7 gap-1.5">
                {weekdayOptions.map((day) => {
                  const isChecked = customDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                        isChecked
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/85 mt-2">
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? (
                <span>Creating...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Create Habit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
