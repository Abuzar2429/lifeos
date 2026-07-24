"use client";

import { useState, useTransition } from "react";
import {
  X,
  Smile,
  Zap,
  Moon,
  Droplets,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Check,
  Sparkles,
} from "lucide-react";
import { upsertDailyCheckIn } from "@/lib/actions/check-in";
import { calculateDailyScore, CheckInInput } from "@/lib/scoring";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CheckInInput | null;
}

const moodOptions = [
  { value: 1, label: "Awful", icon: "😩" },
  { value: 2, label: "Low", icon: "🙁" },
  { value: 3, label: "Okay", icon: "😐" },
  { value: 4, label: "Good", icon: "🙂" },
  { value: 5, label: "Great", icon: "😄" },
];

export function CheckInModal({
  isOpen,
  onClose,
  initialData,
}: CheckInModalProps) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<CheckInInput>({
    mood: initialData?.mood ?? 4,
    energy: initialData?.energy ?? 3,
    sleepHours: initialData?.sleepHours ?? 7.5,
    waterGlasses: initialData?.waterGlasses ?? 8,
    workoutMins: initialData?.workoutMins ?? 30,
    studyHours: initialData?.studyHours ?? 2,
    readingMins: initialData?.readingMins ?? 15,
    reflectionNote: initialData?.reflectionNote ?? "",
  });

  // Calculate score live during render
  const scorePreview = calculateDailyScore(formData);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await upsertDailyCheckIn(formData);
      if (res.success) {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/80 overflow-hidden text-zinc-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Daily Check-In</h3>
              <p className="text-xs text-zinc-400">
                Log today&apos;s wellness and productivity metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Score Preview */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-semibold">
              <span className="text-zinc-400">Est. Score:</span>
              <span className="text-indigo-400 font-bold">{scorePreview}/100</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Mood & Energy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Mood */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Smile className="h-4 w-4 text-emerald-400" />
                Mood Rating
              </label>
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: opt.value })}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                      formData.mood === opt.value
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 scale-105"
                        : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-[10px] mt-1 font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Energy Level ({formData.energy}/5)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, energy: lvl })}
                    className={`h-11 rounded-xl font-bold text-sm border transition-all ${
                      formData.energy === lvl
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 scale-105"
                        : "bg-zinc-950/50 border-zinc-800/80 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sleep & Water */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Sleep */}
            <div className="space-y-2.5 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  Sleep Duration
                </label>
                <span className="text-sm font-bold text-indigo-300 font-mono">
                  {formData.sleepHours} hrs
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={formData.sleepHours}
                onChange={(e) =>
                  setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              {/* Quick Sleep Preset Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setFormData({ ...formData, sleepHours: hrs })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      formData.sleepHours === hrs
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>

            {/* Water */}
            <div className="space-y-2.5 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-400" />
                  Water Intake
                </label>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {formData.waterGlasses} glasses
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      waterGlasses: Math.max(0, formData.waterGlasses - 1),
                    })
                  }
                  className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
                >
                  -
                </button>
                <div className="flex-1 flex justify-center gap-1 overflow-x-auto py-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 w-3 rounded-sm transition-all ${
                        i < formData.waterGlasses
                          ? "bg-cyan-400 shadow-sm shadow-cyan-400/50"
                          : "bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      waterGlasses: formData.waterGlasses + 1,
                    })
                  }
                  className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Activity Metrics with Timing Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Workout */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="h-3.5 w-3.5 text-rose-400" />
                  Workout
                </span>
                <span className="text-xs font-mono font-bold text-rose-300">{formData.workoutMins}m</span>
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.workoutMins}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workoutMins: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, workoutMins: m })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      formData.workoutMins === m
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Study */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-violet-400" />
                  Study Focus
                </span>
                <span className="text-xs font-mono font-bold text-violet-300">{formData.studyHours}h</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.studyHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    studyHours: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[0.5, 1, 1.5, 2, 2.5, 3, 4].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setFormData({ ...formData, studyHours: hrs })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      formData.studyHours === hrs
                        ? "bg-violet-500/20 border-violet-500 text-violet-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>

            {/* Reading */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                  Reading
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">{formData.readingMins}m</span>
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={formData.readingMins}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    readingMins: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormData({ ...formData, readingMins: m })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      formData.readingMins === m
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Reflection */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-zinc-400">
              Daily Reflection / Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What's on your mind today?"
              value={formData.reflectionNote || ""}
              onChange={(e) =>
                setFormData({ ...formData, reflectionNote: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
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
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Check-In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
