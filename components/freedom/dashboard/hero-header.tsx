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
    missionProgress >= 100
      ? "MISSION COMPLETE"
      : missionProgress >= 75
      ? "FINAL STRETCH"
      : missionProgress >= 50
      ? "HALFWAY THERE"
      : missionProgress >= 25
      ? "GAINING MOMENTUM"
      : "MISSION ACTIVE";

  return (
    <header className="relative overflow-hidden grid-bg">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#d4af37]/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text block */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] pulse-dot" />
                <span className="text-xs text-zinc-500 uppercase tracking-[0.2em]">Mission Control Active</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-2">
                <span className="gold-gradient">OPERATION:</span>
                <br />
                <span className="text-white">FREEDOM 2026</span>
              </h1>

              <p className="text-zinc-400 text-lg mt-4 leading-relaxed">
                Build Skills.{" "}
                <span className="text-[#d4af37]">Build Wealth.</span>{" "}
                Build Freedom.
              </p>

              <p className="text-zinc-600 text-sm mt-3">
                {format(today, "EEEE, MMMM d, yyyy")}
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <StatChip
                icon={<Flame className="w-4 h-4 text-orange-400" />}
                label="Day Streak"
                value={dailyStreak}
                suffix="🔥"
              />
              <StatChip
                icon={<Zap className="w-4 h-4 text-[#d4af37]" />}
                label="Weekly Score"
                value={weeklyScore}
                suffix="pts"
              />
              <StatChip
                icon={<TrendingUp className="w-4 h-4 text-[#22c55e]" />}
                label="Monthly Score"
                value={monthlyScore}
                suffix="pts"
              />
            </motion.div>

            {/* Keyboard shortcut hint */}
            <motion.div
              className="mt-6 flex items-center gap-2 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Command className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-xs text-zinc-600">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-[#232329] text-zinc-500 text-xs">⌘K</kbd>{" "}
                to open command palette
              </span>
            </motion.div>
          </div>

          {/* Circular progress */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          >
            <div className="p-6 rounded-3xl glass border border-[#232329] gold-glow">
              <CircularProgress value={missionProgress} label="complete" />
            </div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="text-xs font-semibold tracking-[0.25em] uppercase text-[#d4af37]">
                {completionLabel}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

function StatChip({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-[#232329] min-w-[120px]">
      {icon}
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-bold text-white">
          {value}
          {suffix && <span className="ml-1 text-xs">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
