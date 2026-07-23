"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CheckInModal } from "@/components/check-in/check-in-modal";
import { CommandPalette } from "@/components/layout/command-palette";
import { type CheckInInput } from "@/lib/scoring";

interface AppShellProps {
  children: React.ReactNode;
  todayCheckIn?: CheckInInput | null;
  todayScore?: number | null;
}

export function AppShell({
  children,
  todayCheckIn,
  todayScore,
}: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans antialiased transition-colors duration-200 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenCheckIn={() => setIsCheckInModalOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          todayScore={todayScore}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        initialData={todayCheckIn}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
