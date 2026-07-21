import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = "from-indigo-500/10 via-purple-500/5 to-transparent",
  iconColor = "text-indigo-400",
  badge,
  badgeColor = "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-black/40",
        `bg-gradient-to-br ${gradient}`
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {value}
            </span>
            {badge && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                  badgeColor
                )}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs font-medium text-zinc-400 pt-0.5">{subtitle}</p>
          )}
        </div>

        <div className={cn("p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
