"use client";

import { useState, useTransition } from "react";
import {
  Smile,
  Zap,
  Moon,
  Dumbbell,
  GraduationCap,
  BookOpen,
  Sparkles,
  Check,
  Edit3,
} from "lucide-react";
import { upsertDailyCheckIn } from "@/lib/actions/check-in";
import { calculateDailyScore, type CheckInInput } from "@/lib/scoring";

interface DashboardLoggingBarProps {
  initialCheckIn: CheckInInput | null;
  onRefresh?: () => void;
}

const moodOptions = [
  { value: 1, label: "Awful", icon: "😩" },
  { value: 2, label: "Low", icon: "🙁" },
  { value: 3, label: "Okay", icon: "😐" },
  { value: 4, label: "Good", icon: "🙂" },
  { value: 5, label: "Great", icon: "😄" },
];

export function DashboardLoggingBar({ initialCheckIn }: DashboardLoggingBarProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);

  const [data, setData] = useState<CheckInInput>({
    mood: initialCheckIn?.mood ?? 4,
    energy: initialCheckIn?.energy ?? 3,
    sleepHours: initialCheckIn?.sleepHours ?? 7.5,
    waterGlasses: initialCheckIn?.waterGlasses ?? 8,
    workoutMins: initialCheckIn?.workoutMins ?? 30,
    studyHours: initialCheckIn?.studyHours ?? 2,
    readingMins: initialCheckIn?.readingMins ?? 15,
    reflectionNote: initialCheckIn?.reflectionNote ?? "",
  });

  const estimatedScore = calculateDailyScore(data);

  const handleUpdateField = (updatedData: CheckInInput) => {
    setData(updatedData);
    setIsSaved(false);
    startTransition(async () => {
      const res = await upsertDailyCheckIn(updatedData);
      if (res.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    });
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-950/90 to-zinc-900/90 border border-zinc-800 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Edit3 className="h-3.5 w-3.5" />
            Direct Dashboard Logging
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Daily Health & Productivity Console</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Modify or log your daily metrics directly on the dashboard in 1 click
          </p>
        </div>

        {/* Live Score Badge & Saved Confirmation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-2xl">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Live Daily Score</div>
              <div className="text-lg font-black text-indigo-400 font-mono">{estimatedScore}/100</div>
            </div>
          </div>

          {isSaved && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-fadeIn">
              <Check className="h-3.5 w-3.5" /> Auto-Saved!
            </div>
          )}
        </div>
      </div>

      {/* Grid of Interactive Direct Logging Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Mood & Energy */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 flex flex-col justify-between">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smile className="h-4 w-4 text-emerald-400" />
                Mood
              </span>
              <span className="text-xs text-emerald-400 font-mono">{data.mood}/5</span>
            </label>
            <div className="grid grid-cols-5 gap-1">
              {moodOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleUpdateField({ ...data, mood: opt.value })}
                  disabled={isPending}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    data.mood === opt.value
                      ? "bg-emerald-500/20 border-emerald-500 scale-105"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                  title={opt.label}
                >
                  <span className="text-base">{opt.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/40">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                Energy
              </span>
              <span className="text-xs text-amber-400 font-mono">{data.energy}/5</span>
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleUpdateField({ ...data, energy: lvl })}
                  disabled={isPending}
                  className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                    data.energy === lvl
                      ? "bg-amber-500/20 border-amber-500 text-amber-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {lvl}★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Sleep Duration */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 flex flex-col justify-between">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-indigo-400" />
                Sleep Duration
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300">{data.sleepHours} hrs</span>
            </label>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={data.sleepHours}
              onChange={(e) => handleUpdateField({ ...data, sleepHours: parseFloat(e.target.value) })}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => handleUpdateField({ ...data, sleepHours: hrs })}
                  disabled={isPending}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                    data.sleepHours === hrs
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Study Focus */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 flex flex-col justify-between">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-violet-400" />
                Study Focus
              </span>
              <span className="text-xs font-mono font-bold text-violet-300">{data.studyHours} hrs</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleUpdateField({ ...data, studyHours: Math.max(0, data.studyHours - 0.5) })}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold text-xs"
              >
                -0.5h
              </button>
              <input
                type="number"
                step="0.5"
                min="0"
                value={data.studyHours}
                onChange={(e) => handleUpdateField({ ...data, studyHours: parseFloat(e.target.value) || 0 })}
                className="w-full text-center px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={() => handleUpdateField({ ...data, studyHours: data.studyHours + 0.5 })}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold text-xs"
              >
                +0.5h
              </button>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {[0.5, 1, 1.5, 2, 2.5, 3, 4].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => handleUpdateField({ ...data, studyHours: hrs })}
                  disabled={isPending}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                    data.studyHours === hrs
                      ? "bg-violet-500/30 border-violet-500 text-violet-200"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Workout & Reading */}
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 flex flex-col justify-between">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Dumbbell className="h-4 w-4 text-rose-400" />
                Workout
              </span>
              <span className="text-xs font-mono font-bold text-rose-300">{data.workoutMins}m</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {[15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleUpdateField({ ...data, workoutMins: m })}
                  disabled={isPending}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                    data.workoutMins === m
                      ? "bg-rose-500/30 border-rose-500 text-rose-200"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-800/40">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                Reading
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">{data.readingMins}m</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {[15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleUpdateField({ ...data, readingMins: m })}
                  disabled={isPending}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                    data.readingMins === m
                      ? "bg-emerald-500/30 border-emerald-500 text-emerald-200"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
