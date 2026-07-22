"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

interface JournalTag {
  id: string;
  name: string;
}

interface JournalEntryData {
  id: string;
  title: string;
  content: string;
  moodTag: string | null;
  sentimentScore: number | null;
  createdAt: Date;
  tags: JournalTag[];
}

interface JournalCardProps {
  entry: JournalEntryData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
}

const moodEmojis: Record<string, string> = {
  Happy: "😄",
  Calm: "😌",
  Tired: "😴",
  Anxious: "😰",
  Motivated: "🚀",
};

export function JournalCard({ entry, isSelected, onSelect, onDelete }: JournalCardProps) {
  // Strip HTML to show clean preview snippet
  const plainText = useMemo(() => {
    return entry.content.replace(/<[^>]*>/g, " ").trim();
  }, [entry.content]);

  const snippet = useMemo(() => {
    return plainText.length > 80 ? plainText.slice(0, 80) + "..." : plainText || "No additional text.";
  }, [plainText]);

  // Determine sentiment metrics
  const sentiment = entry.sentimentScore ?? 0.0;
  
  let sentimentBadgeColor = "bg-zinc-800 text-zinc-400 border-zinc-700/60";
  let borderGlow = "hover:border-zinc-700 bg-zinc-900/40 border-zinc-800/80";

  if (sentiment > 0.15) {
    sentimentBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    borderGlow = "hover:border-emerald-500/30 bg-zinc-900/40 border-zinc-800/80";
  } else if (sentiment < -0.15) {
    sentimentBadgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    borderGlow = "hover:border-rose-500/30 bg-zinc-900/40 border-zinc-800/80";
  }

  const moodEmoji = entry.moodTag ? moodEmojis[entry.moodTag] || "📝" : "📝";

  return (
    <div
      onClick={onSelect}
      className={`relative group overflow-hidden rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-indigo-500/60 bg-indigo-950/10 shadow-md shadow-indigo-500/5 scale-[1.01]"
          : borderGlow
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          {/* Top meta row */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              {format(entry.createdAt, "MMM d, yyyy")}
            </span>
            <span className="text-zinc-600">•</span>
            {entry.moodTag && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                <span>{moodEmoji}</span>
                <span>{entry.moodTag}</span>
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {entry.title || "Untitled Entry"}
          </h4>
        </div>

        {/* Sentiment badge */}
        <div className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${sentimentBadgeColor}`}>
          {sentiment >= 0 ? `+${sentiment.toFixed(2)}` : sentiment.toFixed(2)}
        </div>
      </div>

      <p className="text-xs text-zinc-400 leading-normal line-clamp-2 mt-2">
        {snippet}
      </p>

      {/* Tags row */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[9px] font-semibold font-mono text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Hover Delete Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entry.id);
        }}
        title="Delete Entry"
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-rose-450 hover:bg-zinc-800/80 transition-all flex items-center justify-center"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
