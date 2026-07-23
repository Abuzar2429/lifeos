"use client";

import { useState, useTransition } from "react";
import { Droplet, Plus, Minus, CheckCircle2 } from "lucide-react";
import { incrementWaterGlass } from "@/lib/actions/check-in";

interface HydrationWidgetProps {
  currentGlasses?: number;
  targetGlasses?: number;
}

export function HydrationWidget({
  currentGlasses = 0,
  targetGlasses = 8,
}: HydrationWidgetProps) {
  const [glasses, setGlasses] = useState(currentGlasses);
  const [isPending, startTransition] = useTransition();

  const handleWaterClick = (delta: number) => {
    const nextVal = Math.max(0, glasses + delta);
    setGlasses(nextVal);

    startTransition(async () => {
      const res = await incrementWaterGlass(delta);
      if (res.success && res.waterGlasses !== undefined) {
        setGlasses(res.waterGlasses);
      }
    });
  };

  const percentage = Math.min(100, Math.round((glasses / targetGlasses) * 100));

  return (
    <div className="neo-glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="neo-button flex h-10 w-10 items-center justify-center rounded-xl text-cyan-600 dark:text-cyan-400">
            <Droplet className="h-5 w-5 fill-cyan-500/20" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              Quick Hydration Tracker
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Log glasses of water throughout your day</p>
          </div>
        </div>

        {/* Counter Stepper */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWaterClick(-1)}
            disabled={isPending || glasses <= 0}
            className="neo-button flex h-8 w-8 items-center justify-center rounded-xl text-zinc-700 dark:text-zinc-300 text-xs font-bold disabled:opacity-30 transition-all"
            title="Minus 1 Glass"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="text-sm font-extrabold text-zinc-900 dark:text-white px-2 min-w-[60px] text-center">
            {glasses} / {targetGlasses}
          </span>

          <button
            onClick={() => handleWaterClick(1)}
            disabled={isPending}
            className="neo-button flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-cyan-700 dark:text-cyan-300 text-xs font-bold disabled:opacity-50 transition-all hover:scale-105"
            title="Add 1 Glass of Water"
          >
            <Plus className="h-4 w-4" />
            <span>+1 Glass</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Daily Target ({targetGlasses} glasses)</span>
          <span className="font-bold text-cyan-600 dark:text-cyan-400">
            {percentage}% {glasses >= targetGlasses && " • Target Reached! 💧"}
          </span>
        </div>
        <div className="neo-inset h-2 w-full rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
