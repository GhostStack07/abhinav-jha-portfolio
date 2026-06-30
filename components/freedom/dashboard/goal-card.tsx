"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import type { GoalId } from "@/lib/freedom/types";

interface GoalCardProps {
  id: GoalId;
  icon: React.ReactNode;
  name: string;
  progress: number;
  target: number;
  unit: string;
  current: number;
  estimatedCompletion?: Date;
  accentColor?: string;
  onClick: () => void;
  index: number;
}

export function GoalCard({
  icon,
  name,
  progress,
  target,
  unit,
  current,
  estimatedCompletion,
  accentColor = "#d4af37",
  onClick,
  index,
}: GoalCardProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const isComplete = clampedProgress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl border border-[#232329] bg-[#111113] p-5 glass-hover transition-all duration-200"
    >
      {/* Completion badge */}
      {isComplete && (
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold text-[#22c55e] border border-[#22c55e]/30 rounded-full px-2 py-0.5 bg-[#22c55e]/10 success-glow">
            DONE
          </span>
        </div>
      )}

      {/* Icon + name */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-white truncate group-hover:text-[#d4af37] transition-colors">
            {name}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">
            {current.toLocaleString()} / {target.toLocaleString()} {unit}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Progress</span>
          <span
            className="font-bold"
            style={{ color: isComplete ? "#22c55e" : accentColor }}
          >
            {clampedProgress}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#1a1a1e] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: isComplete ? "#22c55e" : accentColor }}
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ delay: index * 0.05 + 0.3, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Estimated completion */}
      {estimatedCompletion && (
        <p className="text-xs text-zinc-600 mt-3">
          Est.{" "}
          <span className="text-zinc-400">
            {format(estimatedCompletion, "MMM yyyy")}
          </span>
        </p>
      )}

      {/* Update button */}
      <button
        className="mt-4 w-full py-2 rounded-xl text-xs font-medium border border-[#232329] text-zinc-400 hover:border-[#d4af37]/50 hover:text-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        Update Progress
      </button>
    </motion.div>
  );
}
