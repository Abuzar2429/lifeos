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
  iconColor = "text-indigo-600 dark:text-indigo-400",
  badge,
  badgeColor = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20",
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "precision-card relative overflow-hidden rounded-2xl p-5",
        `bg-gradient-to-br ${gradient}`
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight font-mono text-zinc-900 dark:text-white">
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
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 pt-0.5">{subtitle}</p>
          )}
        </div>

        <div className={cn("precision-btn p-3 rounded-xl", iconColor)}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
}
