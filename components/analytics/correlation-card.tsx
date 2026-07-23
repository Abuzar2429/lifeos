"use client";

import { LucideIcon, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CorrelationCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  primaryMetric: { label: string; value: string | number };
  secondaryMetric: { label: string; value: string | number };
  impactText: string;
  isPositive?: boolean;
}

export function CorrelationCard({
  title,
  subtitle,
  icon: Icon,
  primaryMetric,
  secondaryMetric,
  impactText,
  isPositive = true,
}: CorrelationCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-4 hover:border-zinc-700/80 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-100">{title}</h3>
            <p className="text-xs text-zinc-500">{subtitle}</p>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
            isPositive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          )}
        >
          <TrendingUp className="h-3 w-3" />
          <span>Correlation</span>
        </div>
      </div>

      {/* Comparison Pillars */}
      <div className="grid grid-cols-2 gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/40 text-center">
        <div className="space-y-0.5">
          <div className="text-[11px] font-medium text-zinc-500">{primaryMetric.label}</div>
          <div className="text-lg font-extrabold text-indigo-400">{primaryMetric.value}</div>
        </div>

        <div className="space-y-0.5 border-l border-zinc-800/60">
          <div className="text-[11px] font-medium text-zinc-500">{secondaryMetric.label}</div>
          <div className="text-lg font-extrabold text-zinc-400">{secondaryMetric.value}</div>
        </div>
      </div>

      {/* Impact summary */}
      <div className="flex items-center gap-2 text-xs text-zinc-300 bg-indigo-500/5 border border-indigo-500/15 p-2.5 rounded-lg">
        <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
        <span>{impactText}</span>
      </div>
    </div>
  );
}
