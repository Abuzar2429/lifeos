"use client";

import { ActivityCalendar, type Activity } from "react-activity-calendar";
import { Calendar, Activity as ActivityIcon } from "lucide-react";
import type { HeatmapDay } from "@/lib/actions/heatmap";

export function ActivityHeatmap({ days }: { days: HeatmapDay[] }) {
  const calendarData: Activity[] = days.map((d) => ({
    date: d.dateStr,
    count: d.habitsCompleted || (d.score > 0 ? 1 : 0),
    level: d.intensity,
  }));

  const activeDaysCount = days.filter((d) => d.intensity > 0).length;
  const totalDays = days.length;
  const consistencyRate = totalDays > 0 ? Math.round((activeDaysCount / totalDays) * 100) : 0;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-3xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
            365-Day Consistency Heatmap
          </h3>
          <p className="text-xs text-zinc-400">
            Powered by react-activity-calendar. Visualizing daily scores and habit completions.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950/60 px-3.5 py-1.5 rounded-xl border border-zinc-800 text-xs">
          <ActivityIcon className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-zinc-400">Annual Consistency:</span>
          <span className="font-bold text-indigo-400">{activeDaysCount} Days ({consistencyRate}%)</span>
        </div>
      </div>

      {/* React Activity Calendar Component */}
      <div className="flex justify-center overflow-x-auto py-2">
        {calendarData.length > 0 ? (
          <ActivityCalendar
            data={calendarData}
            theme={{
              dark: ["#18181b", "#312e81", "#4338ca", "#6366f1", "#a855f7"],
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
