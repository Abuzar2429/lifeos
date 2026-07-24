"use client";

import { useState } from "react";
import { Menu, PlusCircle, User, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenCheckIn?: () => void;
  onOpenSearch?: () => void;
  todayScore?: number | null;
}

export function Header({
  onOpenMobileMenu,
  onOpenCheckIn,
  onOpenSearch,
  todayScore,
}: HeaderProps) {
  // Initialize date directly
  const [dateStr] = useState<string>(() => formatDate(new Date()));

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/70 px-4 md:px-8 backdrop-blur-xl transition-colors duration-200">
      {/* Left side: Mobile menu toggle + Date */}
      <div className="flex items-center gap-4">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
            {dateStr || "Today"}
          </h2>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
            Welcome back, Ashraf 👋
          </p>
        </div>
      </div>

      {/* Center/Right: Quick Search Trigger Button */}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
        >
          <Search className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Search or type</span>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-700 dark:text-zinc-300">
            Cmd + K
          </kbd>
        </button>
      )}

      {/* Right side: Score badge + Quick Check-in Button */}
      <div className="flex items-center gap-3">
        {todayScore !== undefined && todayScore !== null && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
            <span className="text-zinc-500 dark:text-zinc-400">Today&apos;s Score:</span>
            <span
              className={`font-bold ${
                todayScore >= 80
                  ? "text-emerald-600 dark:text-emerald-400"
                  : todayScore >= 60
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {todayScore}/100
            </span>
          </div>
        )}

        {onOpenCheckIn && (
          <button
            onClick={onOpenCheckIn}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Daily Check-In</span>
          </button>
        )}

        <ThemeToggle />

        {/* Profile Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
