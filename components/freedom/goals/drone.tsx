"use client";

import { motion } from "framer-motion";
import { Radio, CheckCircle2, Circle } from "lucide-react";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";

const STEP_COLORS = ["#3b82f6", "#06b6d4", "#22c55e", "#d4af37", "#f97316", "#ef4444", "#a855f7"];

export function DroneModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, toggleChecklistItem } = useAppStore();
  const { checklist } = goals.drone;
  const completed = checklist.filter((c) => c.completed).length;
  const progress = Math.round((completed / checklist.length) * 100);

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Radio className="w-6 h-6 text-[#d4af37]" />}
        title="Drone Pilot"
        subtitle="DGCA Certified Drone Pilot"
        progress={progress}
        current={completed}
        target={checklist.length}
        unit="steps"
      />

      <div className="mt-8 relative">
        {/* Vertical timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-[#232329]" />

        <div className="space-y-4">
          {checklist.map((item, i) => {
            const color = STEP_COLORS[i % STEP_COLORS.length];
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => toggleChecklistItem("drone", item.id)}
                className="relative flex items-center gap-4 pl-12 w-full text-left group"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-2.5 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-200"
                  style={{
                    borderColor: item.completed ? "#22c55e" : color,
                    background: item.completed ? "#22c55e" : `${color}20`,
                  }}
                >
                  {item.completed && <CheckCircle2 className="w-3 h-3 text-black" />}
                </div>

                <div
                  className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150"
                  style={{
                    borderColor: item.completed ? "#22c55e30" : "#232329",
                    background: item.completed ? "#22c55e08" : "#111113",
                  }}
                >
                  <span className="text-xs font-mono text-zinc-600 w-4">{i + 1}</span>
                  <span className={`text-sm font-medium ${item.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                    {item.label}
                  </span>
                  {item.completed && (
                    <span className="ml-auto text-xs text-[#22c55e]">✓</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
