"use client";

import {
  Zap,
  Flame,
  Crown,
  CheckCircle2,
  HeartPulse,
  Sparkles,
  Target,
  Trophy,
  PenTool,
  BookOpen,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Flame,
  Crown,
  CheckCircle2,
  HeartPulse,
  Sparkles,
  Target,
  Trophy,
  PenTool,
  BookOpen,
};

export interface AchievementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export function AchievementCard({ item }: { item: AchievementItem }) {
  const IconComponent = ICON_MAP[item.icon] || Trophy;

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-2xl p-5 border transition-all duration-300",
        item.isUnlocked
          ? "bg-gradient-to-b from-zinc-900/90 to-zinc-950/80 border-indigo-500/30 shadow-lg shadow-indigo-500/5 hover:border-indigo-500/50"
          : "bg-zinc-950/40 border-zinc-800/40 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform",
            item.isUnlocked
              ? "bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-cyan-500/20 border border-indigo-500/40 text-indigo-400"
              : "bg-zinc-900 border border-zinc-800 text-zinc-600"
          )}
        >
          {item.isUnlocked ? (
            <IconComponent className="h-6 w-6 text-indigo-400" />
          ) : (
            <Lock className="h-5 w-5 text-zinc-600" />
          )}
        </div>

        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border",
            item.isUnlocked
              ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
              : "bg-zinc-900 text-zinc-500 border-zinc-800"
          )}
        >
          {item.category}
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-bold text-base text-zinc-100 tracking-tight flex items-center gap-2">
          {item.title}
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
      </div>

      <div className="mt-5 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-[11px]">
        {item.isUnlocked ? (
          <span className="text-indigo-400 font-medium flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Unlocked {item.unlockedAt ? format(new Date(item.unlockedAt), "MMM d, yyyy") : ""}
          </span>
        ) : (
          <span className="text-zinc-500 font-medium">Locked Achievement</span>
        )}
      </div>
    </div>
  );
}
