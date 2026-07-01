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
  icon, name, progress, target, unit, current,
  estimatedCompletion, accentColor = "#d4af37", onClick, index,
}: GoalCardProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const isComplete = clampedProgress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-lg p-5 transition-all duration-200 glass glass-hover"
      style={{
        border: "1px solid var(--rule)",
      }}
    >
      {/* Done badge */}
      {isComplete && (
        <div className="absolute top-4 right-4">
          <span
            className="font-mono text-[9px] font-medium tracking-widest px-2 py-0.5 rounded"
            style={{ color: "var(--success)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            DONE
          </span>
        </div>
      )}

      {/* Icon + name */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center text-lg shrink-0"
          style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-sans font-semibold text-sm truncate transition-colors group-hover:text-[var(--gold)]"
            style={{ color: "var(--ink)" }}
          >
            {name}
          </h3>
          <p className="font-mono text-[10px] mt-0.5 truncate" style={{ color: "var(--ink-faint)" }}>
            {current.toLocaleString()} / {target.toLocaleString()} {unit}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: "var(--ink-faint)" }}>Progress</span>
          <span
            className="font-mono text-xs font-medium"
            style={{ color: isComplete ? "var(--success)" : accentColor }}
          >
            {clampedProgress}%
          </span>
        </div>
        <div className="h-px w-full relative" style={{ background: "var(--rule)" }}>
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{
              height: "2px",
              top: "-0.5px",
              background: isComplete ? "var(--success)" : accentColor,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ delay: index * 0.04 + 0.25, duration: 0.9, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Est. completion */}
      {estimatedCompletion && (
        <p className="font-mono text-[10px] mt-3" style={{ color: "var(--ink-faint)" }}>
          EST. <span style={{ color: "var(--ink-dim)" }}>{format(estimatedCompletion, "MMM yyyy").toUpperCase()}</span>
        </p>
      )}

      {/* CTA */}
      <button
        className="mt-4 w-full py-1.5 rounded font-mono text-[11px] tracking-wider transition-all duration-150"
        style={{
          border: "1px solid var(--rule)",
          color: "var(--ink-dim)",
          background: "transparent",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = accentColor + "60";
          (e.currentTarget as HTMLButtonElement).style.color = accentColor;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rule)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-dim)";
        }}
        onClick={e => { e.stopPropagation(); onClick(); }}
      >
        UPDATE PROGRESS
      </button>
    </motion.div>
  );
}
