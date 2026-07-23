"use client";

import { useState } from "react";
import { Download, Check, Database, FileText } from "lucide-react";
import { exportAllUserData } from "@/lib/actions/settings";

export function ExportWidget() {
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await exportAllUserData();
      if (res.success && res.json) {
        const blob = new Blob([res.json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExported(true);
        setTimeout(() => setExported(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-400" />
            Data Export & Backup
          </h3>
          <p className="text-xs text-zinc-400 max-w-lg">
            Download your complete LifeOS data including all daily check-ins, habit logs, goal milestones, journal entries, and achievements in JSON format.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
        >
          {exported ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              <span>Downloaded!</span>
            </>
          ) : loading ? (
            <span>Exporting...</span>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Export JSON Backup</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-800/60">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-zinc-400" /> JSON Format
        </span>
        <span>•</span>
        <span>Includes Habits, Goals, Journal, Check-Ins</span>
        <span>•</span>
        <span>100% Offline Portability</span>
      </div>
    </div>
  );
}
