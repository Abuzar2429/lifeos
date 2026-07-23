"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  BarChart3,
  Trophy,
  Sparkles,
  Settings,
  X,
  ArrowRight,
  FileText,
} from "lucide-react";
import { searchLifeOS, type SearchResultItem } from "@/lib/actions/search";

const PAGES = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Habits Tracker", url: "/habits", icon: CheckSquare },
  { title: "Goal Milestones", url: "/goals", icon: Target },
  { title: "Smart Journal", url: "/journal", icon: BookOpen },
  { title: "Correlation Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "AI Life Coach", url: "/ai", icon: Sparkles },
  { title: "Settings & Backup", url: "/settings", icon: Settings },
];

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [, startTransition] = useTransition();

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    startTransition(async () => {
      const items = await searchLifeOS(text);
      setSearchResults(items);
    });
  };

  const handleNavigate = (url: string) => {
    onClose();
    setQuery("");
    setSearchResults([]);
    router.push(url);
  };

  if (!isOpen) return null;

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      label="Global LifeOS Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 space-y-0">
        {/* Command Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-950/60">
          <Search className="h-5 w-5 text-indigo-400 shrink-0 mr-3" />
          <Command.Input
            value={query}
            onValueChange={handleQueryChange}
            placeholder="Search habits, goals, journal, pages or type a command... (Esc to close)"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command List Body */}
        <Command.List className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          <Command.Empty className="p-8 text-center text-xs text-zinc-500">
            No matching items found.
          </Command.Empty>

          {/* Search Results Group if Query Present */}
          {query.trim().length > 0 && searchResults.length > 0 && (
            <Command.Group heading={`Search Results (${searchResults.length})`} className="px-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider space-y-1">
              {searchResults.map((res) => (
                <Command.Item
                  key={res.id}
                  value={res.title}
                  onSelect={() => handleNavigate(res.url)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-500/30 border border-transparent text-left transition-all group cursor-pointer aria-selected:bg-indigo-600/15"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-100 group-hover:text-indigo-300">
                        {res.title}
                      </div>
                      <div className="text-xs text-zinc-500">{res.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-indigo-400" />
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Quick Page Navigation */}
          {query.trim().length === 0 && (
            <Command.Group heading="Quick Navigation" className="px-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                {PAGES.map((page) => {
                  const Icon = page.icon;
                  return (
                    <Command.Item
                      key={page.title}
                      value={page.title}
                      onSelect={() => handleNavigate(page.url)}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-800/80 text-left transition-colors group cursor-pointer aria-selected:bg-zinc-800/80"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-white">
                        {page.title}
                      </span>
                    </Command.Item>
                  );
                })}
              </div>
            </Command.Group>
          )}
        </Command.List>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Cmd + K</kbd> to toggle anytime
          </span>
          <span>Powered by cmdk engine</span>
        </div>
      </div>
    </Command.Dialog>
  );
}
