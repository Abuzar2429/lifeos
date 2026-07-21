"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, Calendar, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface CheckInHistoryItem {
  id: string;
  date: Date | string;
  dailyScore: number;
  mood: number;
  energy: number;
  sleepHours: number;
  reflectionNote?: string | null;
}

interface TrendWidgetProps {
  history: CheckInHistoryItem[];
}

export function TrendWidget({ history }: TrendWidgetProps) {
  const chartData = history.map((item) => {
    const d = new Date(item.date);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    return {
      name: dayLabel,
      score: item.dailyScore,
      mood: item.mood,
      sleep: item.sleepHours,
    };
  });

  const reflections = history
    .filter((h) => h.reflectionNote && h.reflectionNote.trim() !== "")
    .slice(-3)
    .reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 7-Day Performance Chart */}
      <div className="lg:col-span-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">7-Day Score Trend</h3>
              <p className="text-xs text-zinc-400">Daily score performance overview</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 font-medium">
            <Calendar className="h-3.5 w-3.5" />
            Past 7 Days
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "0.75rem",
                    color: "#f4f4f5",
                    fontSize: "0.75rem",
                  }}
                  formatter={(val) => [`${val ?? 0} pts`, "Score"]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
            No check-in history logged yet. Complete your first check-in above!
          </div>
        )}
      </div>

      {/* Reflections Sidebar Widget */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl flex flex-col space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Recent Reflections</h3>
            <p className="text-xs text-zinc-400">Your logged notes & thoughts</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-56">
          {reflections.length > 0 ? (
            reflections.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
                  <span>{formatDate(item.date)}</span>
                  <span className="text-indigo-400 font-semibold">{item.dailyScore}/100</span>
                </div>
                <p className="text-xs text-zinc-300 italic line-clamp-3">
                  &quot;{item.reflectionNote}&quot;
                </p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <span className="text-xs text-zinc-500">
                No reflection notes added yet. Add a note during your check-in!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
