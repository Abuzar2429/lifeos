"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Target,
  Trophy,
  AlertCircle,
  Search,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { GoalCard, type GoalWithMilestones, type Milestone } from "@/components/goals/goal-card";
import { GoalModal } from "@/components/goals/goal-modal";

interface SerializedMilestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SerializedGoal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  timeframe: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  completed: boolean;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: SerializedMilestone[];
}

interface GoalsClientProps {
  initialGoals: SerializedGoal[];
}

const timeframes = ["All", "WEEKLY", "MONTHLY", "YEARLY"];
const categories = ["All", "Fitness", "Study", "Health", "Career", "Reading", "Mindfulness", "General"];

export function GoalsClient({ initialGoals }: GoalsClientProps) {
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick refresh helper that triggers RSC refresh
  const refreshData = () => {
    router.refresh();
  };

  // Convert serialized string dates back to Date objects
  const goals: GoalWithMilestones[] = initialGoals.map((g) => ({
    ...g,
    targetDate: g.targetDate ? new Date(g.targetDate) : null,
    createdAt: new Date(g.createdAt),
    updatedAt: new Date(g.updatedAt),
    milestones: g.milestones.map((m: SerializedMilestone) => ({
      ...m,
      createdAt: new Date(m.createdAt),
      updatedAt: new Date(m.updatedAt),
    })),
  }));

  // Calculations for stats
  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  // Overdue check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueCount = activeGoals.filter((g) => {
    if (!g.targetDate) return false;
    const deadline = new Date(g.targetDate);
    deadline.setHours(0, 0, 0, 0);
    return deadline.getTime() < today.getTime();
  }).length;

  // Milestone check success rate
  let totalMilestones = 0;
  let completedMilestones = 0;
  goals.forEach((g) => {
    totalMilestones += g.milestones.length;
    completedMilestones += g.milestones.filter((m: Milestone) => m.completed).length;
  });
  const milestonesRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Filters
  const filteredGoals = goals.filter((goal) => {
    const matchesTimeframe = selectedTimeframe === "All" || goal.timeframe === selectedTimeframe;
    const matchesCategory = selectedCategory === "All" || goal.category === selectedCategory;
    const matchesSearch =
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (goal.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTimeframe && matchesCategory && matchesSearch;
  });

  return (
    <AppShell>
      {/* Page Header banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/40 p-6 md:p-8 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Target className="h-7 w-7 text-purple-400" />
              Goal Objectives
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Map out monthly and yearly milestones to track your progress systematically.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Active Goals"
          value={`${activeGoals.length}`}
          subtitle="In-progress objectives"
          icon={Target}
          gradient="from-purple-600/15 via-purple-900/5 to-transparent"
          iconColor="text-purple-400"
        />

        <MetricCard
          title="Completed Goals"
          value={`${completedGoals.length}`}
          subtitle="Accomplished objectives"
          icon={Trophy}
          gradient="from-emerald-600/15 via-emerald-900/5 to-transparent"
          iconColor="text-emerald-400"
        />

        <MetricCard
          title="Overdue Objectives"
          value={`${overdueCount}`}
          subtitle="Past target deadlines"
          icon={AlertCircle}
          gradient="from-rose-600/15 via-rose-900/5 to-transparent"
          iconColor="text-rose-400"
          badge={overdueCount > 0 ? "Action Required" : undefined}
          badgeColor="bg-rose-500/15 text-rose-300 border-rose-500/30"
        />

        <MetricCard
          title="Milestone Success"
          value={totalMilestones > 0 ? `${milestonesRate}%` : "--"}
          subtitle="Checklist completion rate"
          icon={CheckCircle2}
          gradient="from-indigo-600/15 via-indigo-900/5 to-transparent"
          iconColor="text-indigo-400"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="space-y-4 border-t border-zinc-800/50 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Timeframe Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedTimeframe === tf
                    ? "bg-purple-600/15 text-purple-300 border-purple-500/30 shadow-sm"
                    : "bg-zinc-950/20 border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {tf === "All" ? "All Timeframes" : tf.charAt(0) + tf.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-900/60 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600/15 text-indigo-300 border-indigo-500/30 shadow-sm"
                  : "bg-zinc-950/10 border-zinc-850/80 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Cards Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onRefresh={refreshData} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/10 backdrop-blur-sm">
          <Target className="h-10 w-10 text-zinc-650 mb-3" />
          <h3 className="text-base font-bold text-white">No objectives found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
            {searchQuery || selectedCategory !== "All" || selectedTimeframe !== "All"
              ? "Try adjusting your filters or search terms."
              : "Set your monthly and yearly objectives with milestone tasks to track success."}
          </p>
          {!searchQuery && selectedCategory === "All" && selectedTimeframe === "All" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all"
            >
              Create Your First Goal
            </button>
          )}
        </div>
      )}

      {/* Creation Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshData}
      />
    </AppShell>
  );
}
