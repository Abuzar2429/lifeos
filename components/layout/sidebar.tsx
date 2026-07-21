"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  BarChart3,
  Sparkles,
  Settings,
  Flame,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Habits", href: "/habits", icon: CheckSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Companion", href: "/ai", icon: Sparkles },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/60 text-zinc-100 transition-transform duration-300 md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800/60">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                LifeOS
              </span>
              <span className="text-[10px] uppercase font-medium tracking-wider text-indigo-400">
                Personal Control Center
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Menu
          </div>

          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                    : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 + w-4 transition-colors",
                    isActive
                      ? "text-indigo-400"
                      : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                <span>{item.name}</span>

                {item.href === "/ai" && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Footer / Settings */}
        <div className="p-4 border-t border-zinc-800/60">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100 transition-colors"
          >
            <Settings className="h-4 w-4 text-zinc-500" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
