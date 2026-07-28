"use client";

import { useSyncExternalStore, useState } from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";
import { Calendar, Activity as ActivityIcon, Sparkles } from "lucide-react";
import type { HeatmapDay } from "@/lib/actions/heatmap";

const emptySubscribe = () => () => {};

const THEMES = {
  "github-green": {
    name: "GitHub Bright Green",
    colors: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    accent: "text-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  emerald: {
    name: "Emerald Glow",
    colors: ["#18181b", "#064e3b", "#047857", "#10b981", "#34d399"],
    accent: "text-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  indigo: {
    name: "Indigo Pulse",
    colors: ["#18181b", "#312e81", "#4338ca", "#6366f1", "#a855f7"],
    accent: "text-indigo-400",
    badge: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  },
  cyber: {
    name: "Cyber Neon",
    colors: ["#18181b", "#1e1b4b", "#0284c7", "#06b6d4", "#22d3ee"],
    accent: "text-cyan-400",
    badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  },
};

export function ActivityHeatmap({ days }: { days: HeatmapDay[] }) {
  const [activeThemeKey, setActiveThemeKey] = useState<keyof typeof THEMES>("github-green");
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const activeTheme = THEMES[activeThemeKey];

  const calendarData: Activity[] = days.map((d) => ({
    date: d.dateStr,
    count: d.habitsCompleted || (d.score > 0 ? 1 : 0),
    level: d.intensity,
  }));

  const activeDaysCount = days.filter((d) => d.intensity > 0).length;
  const totalDays = days.length;
  const consistencyRate = totalDays > 0 ? Math.round((activeDaysCount / totalDays) * 100) : 0;
  const todayEntry = days[days.length - 1];

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-3xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${activeTheme.accent}`} />
            365-Day Consistency Heatmap
            {todayEntry?.intensity === 4 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <Sparkles className="h-3 w-3 text-emerald-400" /> Today Bright Green!
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-400">
            Powered by react-activity-calendar. Visualizing daily scores and habit completions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Theme Selector */}
          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs">
            {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((key) => (
              <button
                key={key}
                onClick={() => setActiveThemeKey(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  activeThemeKey === key
                    ? "bg-zinc-800 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                {key === "github-green" ? "🟢 Git Green" : key === "emerald" ? "🌿 Emerald" : key === "indigo" ? "🔮 Indigo" : "⚡ Cyber"}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs ${activeTheme.badge}`}>
            <ActivityIcon className="h-3.5 w-3.5" />
            <span className="text-zinc-300">Annual Consistency:</span>
            <span className="font-bold">{activeDaysCount} Days ({consistencyRate}%)</span>
          </div>
        </div>
      </div>

      {/* React Activity Calendar Component */}
      <div className="flex justify-center overflow-x-auto py-2 min-h-[160px] items-center">
        {!mounted ? (
          <div className="h-28 w-full max-w-4xl bg-zinc-950/40 border border-zinc-800/40 rounded-2xl animate-pulse flex items-center justify-center text-xs text-zinc-500">
            Loading Consistency Heatmap...
          </div>
        ) : calendarData.length > 0 ? (
          <ActivityCalendar
            data={calendarData}
            colorScheme="dark"
            theme={{
              dark: activeTheme.colors,
            }}
            labels={{
              totalCount: "{{count}} active days in past 365 days",
            }}
            blockSize={13}
            blockRadius={4}
            blockMargin={4}
            fontSize={12}
          />
        ) : (
          <div className="p-8 text-xs text-zinc-500">No activity data logged yet.</div>
        )}
      </div>
    </div>
  );
}
