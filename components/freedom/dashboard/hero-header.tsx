"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { CircularProgress } from "./circular-progress";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { Flame, Zap, TrendingUp } from "lucide-react";

export function HeroHeader() {
  const { missionProgress, dailyStreak, weeklyScore, monthlyScore } = useAppStore();
  const today = new Date();

  const completionLabel =
    missionProgress >= 100 ? "MISSION COMPLETE" :
    missionProgress >= 75  ? "FINAL STRETCH"    :
    missionProgress >= 50  ? "HALFWAY THERE"    :
    missionProgress >= 25  ? "GAINING MOMENTUM" : "MISSION ACTIVE";

  return (
    <header className="relative overflow-hidden grid-bg border-b border-[var(--rule)]">
      {/* Subtle warm glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-[#d4af37]/4 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

          {/* ── Text ── */}
          <div className="flex-1 text-center lg:text-left w-full">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Section label — portfolio style */}
              <p className="label-mono mb-4 flex items-center gap-2 justify-center lg:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] pulse-dot inline-block" />
                Personal · Mission Control · 2026
              </p>

              {/* Title — Instrument Serif like the portfolio headings */}
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[0.95] mb-4 tracking-tight">
                <span className="gold-gradient italic">Operation:</span>
                <br />
                <span style={{ color: "var(--ink)" }}>Freedom</span>
                <span className="gold-gradient"> 2026</span>
              </h1>

              <p className="text-sm sm:text-base mt-4 leading-relaxed" style={{ color: "var(--ink-dim)" }}>
                Build Skills.{" "}
                <em className="font-serif not-italic" style={{ color: "var(--gold)" }}>Build Wealth.</em>
                {" "}Build Freedom.
              </p>

              {/* Date — mono like portfolio */}
              <p className="label-mono mt-3">{format(today, "EEEE, MMMM d, yyyy")}</p>
            </motion.div>

            {/* Stats — mono, compact, single row */}
            <motion.div
              className="flex gap-2 sm:gap-3 mt-6 justify-center lg:justify-start overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            >
              <StatChip icon={<Flame className="w-3 h-3" style={{ color: "#ff5c38" }} />} label="Streak" value={dailyStreak} suffix="days" />
              <StatChip icon={<Zap className="w-3 h-3" style={{ color: "var(--gold)" }} />} label="Weekly" value={weeklyScore} suffix="pts" />
              <StatChip icon={<TrendingUp className="w-3 h-3" style={{ color: "var(--success)" }} />} label="Monthly" value={monthlyScore} suffix="pts" />
            </motion.div>

            {/* Keyboard hint — mono */}
            <motion.p
              className="hidden sm:block label-mono mt-5 justify-center lg:justify-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            >
              Press{" "}
              <kbd
                className="px-1.5 py-0.5 rounded border text-[10px]"
                style={{ borderColor: "var(--rule)", color: "var(--ink-dim)" }}
              >
                ⌘K
              </kbd>
              {" "}to open command palette
            </motion.p>
          </div>

          {/* ── Progress ring ── */}
          <motion.div
            className="flex flex-col items-center gap-3 shrink-0"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, type: "spring" }}
          >
            <div
              className="p-4 sm:p-6 rounded-xl gold-glow glass"
              style={{ border: "1px solid var(--rule)" }}
            >
              <div className="sm:hidden">
                <CircularProgress value={missionProgress} size={160} strokeWidth={10} label="complete" />
              </div>
              <div className="hidden sm:block">
                <CircularProgress value={missionProgress} size={200} strokeWidth={11} label="complete" />
              </div>
            </div>
            <p className="label-mono" style={{ color: "var(--gold)" }}>{completionLabel}</p>
          </motion.div>

        </div>
      </div>
    </header>
  );
}

function StatChip({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number; suffix?: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg shrink-0 glass"
      style={{ border: "1px solid var(--rule)" }}
    >
      {icon}
      <div>
        <p className="label-mono" style={{ color: "var(--ink-faint)" }}>{label}</p>
        <p className="font-mono text-xs sm:text-sm font-medium mt-0.5" style={{ color: "var(--ink)" }}>
          {value}
          {suffix && <span className="ml-1 text-[10px]" style={{ color: "var(--ink-dim)" }}>{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
