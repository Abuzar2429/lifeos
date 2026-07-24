import { AppShell } from "@/components/layout/app-shell";
import { getUserPreferences } from "@/lib/actions/settings";
import { ExportWidget } from "@/components/settings/export-widget";
import { Settings as SettingsIcon, Shield, Layers, Compass } from "lucide-react";

export const revalidate = 0;

export default async function SettingsPage() {
  const preferences = await getUserPreferences();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950/80 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold">
            <SettingsIcon className="h-3.5 w-3.5 text-zinc-400" />
            Settings & Preferences
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            System Settings & Data Control
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Manage your focus areas, view system defaults, and export full JSON data backups.
          </p>
        </div>

        {/* User Info & Focus Areas Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-zinc-800/80">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-extrabold text-xl shadow-lg shadow-indigo-500/20">
              A
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Ashraf (Demo User)</h2>
              <p className="text-xs text-zinc-400">demo@lifeos.app • Personal Workspace</p>
            </div>
          </div>

          {/* Focus Areas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-400" />
              Selected Life Focus Areas
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferences.focusAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Top Priorities */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              Active Priorities
            </h3>
            <div className="space-y-2">
              {preferences.topPriorities.map((priority, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60"
                >
                  <div className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span>{priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Widget */}
        <ExportWidget />

        {/* Privacy Notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-400">
          <Shield className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>
            LifeOS is designed with local-first privacy. Your health scores, goals, and journal entries are processed locally on your system.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
