"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  Search,
  Hash,
  PenTool,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { JournalCard } from "@/components/journal/journal-card";
import { JournalEditor } from "@/components/journal/journal-editor";
import { createJournalEntry, updateJournalEntry, deleteJournalEntry } from "@/lib/actions/journal";

interface SerializedTag {
  id: string;
  name: string;
}

interface SerializedJournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  moodTag: string | null;
  sentimentScore: number | null;
  createdAt: string;
  updatedAt: string;
  tags: SerializedTag[];
}

interface JournalClientProps {
  initialEntries: SerializedJournalEntry[];
}

export function JournalClient({ initialEntries }: JournalClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Convert serialized string dates back to Date objects
  const entries = initialEntries.map((e) => ({
    ...e,
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt),
  }));

  // Extract all unique tags for filtering
  const allTags = Array.from(
    new Set(entries.flatMap((entry) => entry.tags.map((t) => t.name)))
  );

  // Find the currently selected entry
  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || null;

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.replace(/<[^>]*>/g, "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || entry.tags.some((t) => t.name === selectedTag);

    return matchesSearch && matchesTag;
  });

  const handleSave = async (data: { title: string; content: string; moodTag: string | null; tags: string[] }) => {
    if (selectedEntryId) {
      // Update
      const res = await updateJournalEntry(selectedEntryId, data);
      if (res.success) {
        router.refresh();
      }
    } else {
      // Create
      const res = await createJournalEntry(data);
      if (res.success && res.entry) {
        setSelectedEntryId(res.entry.id);
        router.refresh();
      }
    }
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteJournalEntry(id);
      if (res.success) {
        if (selectedEntryId === id) {
          setSelectedEntryId(null);
        }
        router.refresh();
      }
    });
  };

  return (
    <AppShell>
      {/* Splits Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
        {/* Left Side: Sidebar list (5 cols) */}
        <div className="lg:col-span-4 flex flex-col h-full space-y-4">
          {/* Header Action Card */}
          <div className="flex-none flex items-center justify-between gap-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Journal List</h2>
            </div>

            <button
              onClick={() => setSelectedEntryId(null)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Write Entry</span>
            </button>
          </div>

          {/* Search & Tags */}
          <div className="flex-none space-y-2.5 p-4 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-xl">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Query reflections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tag Pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-zinc-850/50 pt-2.5">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    !selectedTag
                      ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                      : "bg-zinc-950/20 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  All
                </button>
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(t === selectedTag ? null : t)}
                    className={`flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      selectedTag === t
                        ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                        : "bg-zinc-950/20 border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <Hash className="h-2.5 w-2.5" />
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrolling Cards Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  isSelected={selectedEntryId === entry.id}
                  onSelect={() => setSelectedEntryId(entry.id)}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/10 backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-zinc-650 mb-2" />
                <h4 className="text-xs font-bold text-white">No reflections logged</h4>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-[180px] leading-relaxed">
                  {searchQuery || selectedTag
                    ? "Adjust search terms or tag filter query."
                    : "Tap 'Write Entry' to log today's smart journal thoughts."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Workspace Editor (8 cols) */}
        <div className="lg:col-span-8 h-full flex flex-col">
          {selectedEntryId || selectedEntryId === null ? (
            <JournalEditor
              key={selectedEntryId || "new"}
              entry={selectedEntry}
              onSave={handleSave}
              isNew={!selectedEntryId}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-zinc-800/80 rounded-2xl bg-zinc-900/40 backdrop-blur-xl p-8 text-center">
              <PenTool className="h-12 w-12 text-zinc-600 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Smart Reflection Hub</h3>
              <p className="text-sm text-zinc-400 mt-1.5 max-w-sm leading-relaxed">
                Choose an entry in the list to review and modify it, or click the &quot;Write Entry&quot; button to record fresh thoughts.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
