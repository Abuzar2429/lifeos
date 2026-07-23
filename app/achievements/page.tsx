import { getAchievements } from "@/lib/actions/achievement";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Trophy, Sparkles, Award } from "lucide-react";

export const revalidate = 0;

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  const total = achievements.length;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const unlockPercentage = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-950/80 p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Trophy className="h-3.5 w-3.5" />
            Gamification & Badges
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Personal Milestones & Achievements
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Track your life streaks, check-in consistency, high daily scores, and goal milestones as you level up your daily routine.
          </p>
        </div>

        {/* Progress Card */}
        <div className="flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl min-w-[220px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-white tracking-tight">
              {unlockedCount} <span className="text-xs font-semibold text-zinc-400">/ {total}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${unlockPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-indigo-400">{unlockPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievements.map((item) => (
          <AchievementCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
