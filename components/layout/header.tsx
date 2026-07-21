"use client";

import { useState } from "react";
import { Menu, PlusCircle, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenCheckIn?: () => void;
  todayScore?: number | null;
}

export function Header({
  onOpenMobileMenu,
  onOpenCheckIn,
  todayScore,
}: HeaderProps) {
  // Initialize date directly
  const [dateStr] = useState<string>(() => formatDate(new Date()));

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/60 bg-zinc-950/70 px-4 md:px-8 backdrop-blur-xl">
      {/* Left side: Mobile menu toggle + Date */}
      <div className="flex items-center gap-4">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/50 md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            {dateStr || "Today"}
          </h2>
          <p className="text-sm font-medium text-zinc-200">
            Welcome back, Ashraf 👋
          </p>
        </div>
      </div>

      {/* Right side: Score badge + Quick Check-in Button */}
      <div className="flex items-center gap-3">
        {todayScore !== undefined && todayScore !== null && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium">
            <span className="text-zinc-400">Today&apos;s Score:</span>
            <span
              className={`font-bold ${
                todayScore >= 80
                  ? "text-emerald-400"
                  : todayScore >= 60
                  ? "text-amber-400"
                  : "text-indigo-400"
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

        {/* Profile Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300">
          <User className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
