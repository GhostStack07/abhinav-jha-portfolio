"use client";

import { motion } from "framer-motion";
import { Waves, CheckCircle2, Lock } from "lucide-react";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";

const LEVEL_COLORS = ["#3b82f6", "#06b6d4", "#22c55e", "#d4af37", "#f97316", "#ef4444"];

export function SwimmingModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, toggleChecklistItem } = useAppStore();
  const { levels } = goals.swimming;
  const completed = levels.filter((l) => l.completed).length;
  const progress = Math.round((completed / levels.length) * 100);

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Waves className="w-6 h-6 text-[#3b82f6]" />}
        title="Swimming"
        subtitle="Master the water — one level at a time"
        progress={progress}
        current={completed}
        target={levels.length}
        unit="levels"
      />

      {/* Radial progress ring visual */}
      <div className="flex justify-center my-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="-rotate-90 w-32 h-32">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a1e" strokeWidth="10" />
            <motion.circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={314}
              initial={{ strokeDashoffset: 314 }}
              animate={{ strokeDashoffset: 314 - (314 * progress) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[#3b82f6]">{progress}%</span>
            <span className="text-xs text-zinc-500">complete</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {levels.map((level, i) => {
          const isUnlocked = i === 0 || levels[i - 1].completed;
          const color = LEVEL_COLORS[i];

          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => isUnlocked && toggleChecklistItem("swimming", level.id)}
              disabled={!isUnlocked}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150 text-left ${
                level.completed
                  ? "border-[#22c55e]/40 bg-[#22c55e]/5"
                  : isUnlocked
                  ? "border-[#232329] bg-[#111113] hover:border-opacity-50 cursor-pointer"
                  : "border-[#232329] bg-[#0d0d0f] opacity-50 cursor-not-allowed"
              }`}
              style={level.completed ? {} : isUnlocked ? { borderColor: `${color}30` } : {}}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: `${level.completed ? "#22c55e" : color}15`, color: level.completed ? "#22c55e" : color }}
              >
                {level.completed ? <CheckCircle2 className="w-4 h-4" /> : isUnlocked ? i + 1 : <Lock className="w-3 h-3" />}
              </div>
              <span className={`text-sm font-medium ${level.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                {level.label}
              </span>
              {level.completed && (
                <span className="ml-auto text-xs text-[#22c55e] border border-[#22c55e]/30 rounded-full px-2 py-0.5 bg-[#22c55e]/10">
                  ✓ Unlocked
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
