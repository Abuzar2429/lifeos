"use client";

import { useState } from "react";
import { GitCommit, Sparkles, CheckCircle2 } from "lucide-react";
import { boostTodayToBrightGreen } from "@/lib/actions/heatmap";

export function GitGreenBadge() {
  const [boosted, setBoosted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    setLoading(true);
    try {
      const res = await boostTodayToBrightGreen();
      if (res.success) {
        setBoosted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/60 border border-emerald-500/30 p-5 rounded-3xl space-y-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <GitCommit className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Today's Git Activity</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" /> Bright Green (#39d353)
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              GitHub Level 4 Maximum Activity • July 28, 2026
            </p>
          </div>
        </div>

        <button
          onClick={handleBoost}
          disabled={loading || boosted}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg ${
            boosted
              ? "bg-emerald-500 text-zinc-950 shadow-emerald-500/20"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
          }`}
        >
          {boosted ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Boosted Bright Green!
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-400" /> Boost Heatmap Today
            </>
          )}
        </button>
      </div>
    </div>
  );
}
