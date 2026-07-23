"use client";

import { useState, useTransition } from "react";
import { Droplet, Plus, Minus } from "lucide-react";
import { incrementWaterGlass } from "@/lib/actions/check-in";

interface HydrationWidgetProps {
  currentGlasses?: number;
  targetGlasses?: number;
}

export function HydrationWidget({ currentGlasses = 0 }: HydrationWidgetProps) {
  const [glasses, setGlasses] = useState(currentGlasses);
  const [isPending, startTransition] = useTransition();

  const handleIncrement = (delta: number) => {
    const nextVal = Math.max(0, glasses + delta);
    setGlasses(nextVal);

    startTransition(async () => {
      const res = await incrementWaterGlass(delta);
      if (res.success && res.waterGlasses !== undefined) {
        setGlasses(res.waterGlasses);
      }
    });
  };

  const targetGlasses = 8;
  const percentage = Math.min(100, Math.round((glasses / targetGlasses) * 100));

  return (
    <div className="precision-card relative overflow-hidden rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="precision-btn p-2.5 rounded-xl text-cyan-600 dark:text-cyan-400 shrink-0">
          <Droplet className="h-5 w-5 fill-cyan-500/20" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Quick Hydration Tracker</h3>
            <span className="text-[10px] font-bold font-mono text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              {percentage}%
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Log water intake throughout your day ({targetGlasses} glasses target)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Progress bar */}
        <div className="w-32 sm:w-44 space-y-1">
          <div className="precision-well h-2.5 w-full rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Stepper controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleIncrement(-1)}
            disabled={isPending || glasses <= 0}
            className="precision-btn flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold disabled:opacity-30 transition-all"
            title="Remove 1 glass"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white min-w-[3rem] text-center">
            {glasses} / {targetGlasses}
          </span>

          <button
            onClick={() => handleIncrement(1)}
            disabled={isPending}
            className="precision-btn px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-600 dark:text-cyan-300 flex items-center gap-1 hover:scale-105 transition-all"
            title="Add 1 glass"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+1 Glass</span>
          </button>
        </div>
      </div>
    </div>
  );
}
