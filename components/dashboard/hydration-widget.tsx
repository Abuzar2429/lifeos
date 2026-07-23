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
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-zinc-900/60 to-zinc-950/80 p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Droplet className="h-5 w-5 fill-cyan-400/20" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Quick Hydration Tracker
            </h3>
            <p className="text-xs text-zinc-400">Log glasses of water throughout your day</p>
          </div>
        </div>

        {/* Counter Stepper */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWaterClick(-1)}
            disabled={isPending || glasses <= 0}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold disabled:opacity-30 transition-colors"
            title="Minus 1 Glass"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="text-sm font-extrabold text-white px-2 min-w-[60px] text-center">
            {glasses} / {targetGlasses}
          </span>

          <button
            onClick={() => handleWaterClick(1)}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 disabled:opacity-50 transition-all hover:scale-105"
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
          <span className="text-zinc-400 font-medium">Daily Target ({targetGlasses} glasses)</span>
          <span className="font-bold text-cyan-400">
            {percentage}% {glasses >= targetGlasses && " • Target Reached! 💧"}
          </span>
        </div>
        <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
