"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { CircularProgress } from "./circular-progress";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { Flame, Zap, TrendingUp, Command } from "lucide-react";

export function HeroHeader() {
  const { missionProgress, dailyStreak, weeklyScore, monthlyScore } = useAppStore();
  const today = new Date();

  const completionLabel =
    missionProgress >= 100 ? "MISSION COMPLETE" :
    missionProgress >= 75  ? "FINAL STRETCH"    :
    missionProgress >= 50  ? "HALFWAY THERE"    :
    missionProgress >= 25  ? "GAINING MOMENTUM" : "MISSION ACTIVE";

  return (
    <header className="relative overflow-hidden grid-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#d4af37]/5 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          {/* Text block */}
          <div className="flex-1 text-center lg:text-left w-full">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] pulse-dot" />
                <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-[0.2em]">Mission Control Active</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-2">
                <span className="gold-gradient">OPERATION:</span>
                <br />
                <span className="text-white">FREEDOM 2026</span>
              </h1>

              <p className="text-zinc-400 text-base sm:text-lg mt-3">
                Build Skills. <span className="text-[#d4af37]">Build Wealth.</span> Build Freedom.
              </p>
              <p className="text-zinc-600 text-xs sm:text-sm mt-2">{format(today, "EEEE, MMMM d, yyyy")}</p>
            </motion.div>

            {/* Stats — single scrollable row on mobile */}
            <motion.div
              className="flex gap-2 sm:gap-3 mt-5 justify-center lg:justify-start overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            >
              <StatChip icon={<Flame className="w-3.5 h-3.5 text-orange-400" />} label="Streak" value={dailyStreak} suffix="🔥" />
              <StatChip icon={<Zap className="w-3.5 h-3.5 text-[#d4af37]" />} label="Weekly" value={weeklyScore} suffix="pts" />
              <StatChip icon={<TrendingUp className="w-3.5 h-3.5 text-[#22c55e]" />} label="Monthly" value={monthlyScore} suffix="pts" />
            </motion.div>

            <motion.div
              className="hidden sm:flex mt-4 items-center gap-2 justify-center lg:justify-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            >
              <Command className="w-3 h-3 text-zinc-600" />
              <span className="text-xs text-zinc-600">
                Press <kbd className="px-1.5 py-0.5 rounded border border-[#232329] text-zinc-500 text-xs">⌘K</kbd> to open command palette
              </span>
            </motion.div>
          </div>

          {/* Circular progress */}
          <motion.div
            className="flex flex-col items-center gap-3 shrink-0"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          >
            <div className="p-4 sm:p-6 rounded-3xl glass border border-[#232329] gold-glow">
              <div className="sm:hidden">
                <CircularProgress value={missionProgress} size={160} strokeWidth={10} label="complete" />
              </div>
              <div className="hidden sm:block">
                <CircularProgress value={missionProgress} size={220} strokeWidth={12} label="complete" />
              </div>
            </div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#d4af37]">{completionLabel}</span>
          </motion.div>

        </div>
      </div>
    </header>
  );
}

function StatChip({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-[#232329] shrink-0">
      {icon}
      <div>
        <p className="text-[10px] text-zinc-500 leading-none">{label}</p>
        <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
          {value}{suffix && <span className="ml-1 text-[10px]">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
