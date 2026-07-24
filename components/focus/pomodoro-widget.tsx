"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerMode = "work" | "shortBreak" | "longBreak";

const MODE_CONFIGS: Record<TimerMode, { label: string; defaultMins: number; color: string; bgGradient: string }> = {
  work: {
    label: "Deep Work Focus",
    defaultMins: 25,
    color: "text-indigo-400 border-indigo-500/30",
    bgGradient: "from-indigo-600 to-violet-600",
  },
  shortBreak: {
    label: "Short Refresh Break",
    defaultMins: 5,
    color: "text-emerald-400 border-emerald-500/30",
    bgGradient: "from-emerald-600 to-teal-600",
  },
  longBreak: {
    label: "Long Rest Break",
    defaultMins: 15,
    color: "text-cyan-400 border-cyan-500/30",
    bgGradient: "from-cyan-600 to-blue-600",
  },
};

export function PomodoroWidget() {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIGS.work.defaultMins * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentConfig = MODE_CONFIGS[mode];
  const totalSeconds = currentConfig.defaultMins * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_CONFIGS[newMode].defaultMins * 60);
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentConfig.defaultMins * 60);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === "work") {
              setSessionsCompleted((s) => s + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-950/80 to-zinc-900/90 border border-zinc-800/80 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Timer className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">LifeOS Focus Engine</h3>
            <p className="text-[11px] text-zinc-400">Pomodoro Interval Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
            <CheckCircle className="h-3 w-3 text-emerald-400" />
            {sessionsCompleted} {sessionsCompleted === 1 ? "Session" : "Sessions"}
          </span>
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={soundEnabled ? "Mute chimes" : "Unmute chimes"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-indigo-400" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-2xl bg-zinc-950 p-1 border border-zinc-800/80">
        {(Object.keys(MODE_CONFIGS) as TimerMode[]).map((m) => {
          const cfg = MODE_CONFIGS[m];
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center",
                active
                  ? "bg-zinc-800 text-white shadow-md border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {cfg.label.split(" ")[0]} ({cfg.defaultMins}m)
            </button>
          );
        })}
      </div>

      {/* Timer Circular Display */}
      <div className="flex flex-col items-center justify-center py-4 space-y-4">
        <div className="relative flex items-center justify-center h-48 w-48 rounded-full border-4 border-zinc-800/80 bg-zinc-950/60 shadow-inner">
          {/* Progress Overlay */}
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-zinc-800/40"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={cn(
                "transition-all duration-500",
                mode === "work"
                  ? "stroke-indigo-500"
                  : mode === "shortBreak"
                  ? "stroke-emerald-500"
                  : "stroke-cyan-500"
              )}
              strokeWidth="6"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time & Controls */}
          <div className="text-center z-10 space-y-1">
            <div className="text-4xl font-black tracking-tight text-white font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className={cn("text-[11px] font-semibold uppercase tracking-wider", currentConfig.color)}>
              {currentConfig.label}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={toggleTimer}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold text-white shadow-xl transition-all hover:scale-105 active:scale-95",
              `bg-gradient-to-r ${currentConfig.bgGradient}`
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" /> Start Focus
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all hover:scale-105"
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
