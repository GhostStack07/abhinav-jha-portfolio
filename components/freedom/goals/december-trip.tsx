"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, CheckCircle2, Circle, Clock } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";
import { EditableMetric } from "./editable-metric";

const TRIP_DATE = new Date("2026-12-15");

export function DecemberTripModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, toggleChecklistItem, updateGoalField } = useAppStore();
  const data = goals["december-trip"];

  const checkedItems = data.checklist.filter((c) => c.completed).length;
  const progress = Math.round((checkedItems / data.checklist.length) * 100);
  const savingsProgress = Math.min(Math.round((data.savedAmount / data.budget) * 100), 100);
  const daysLeft = Math.max(differenceInDays(TRIP_DATE, new Date()), 0);

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Plane className="w-6 h-6 text-[#d4af37]" />}
        title="December Trip"
        subtitle={data.destination}
        progress={progress}
        current={checkedItems}
        target={data.checklist.length}
        unit="tasks done"
      />

      {/* Countdown */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-[#d4af37]/10 to-transparent border border-[#d4af37]/20 flex items-center gap-4">
        <Clock className="w-8 h-8 text-[#d4af37]" />
        <div>
          <p className="text-4xl font-black text-[#d4af37]">{daysLeft}</p>
          <p className="text-xs text-zinc-500">days until departure</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-semibold text-white">Dec 15, 2026</p>
          <p className="text-xs text-zinc-500">Target date</p>
        </div>
      </div>

      {/* Budget tracker */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <EditableMetric
          label="Trip Budget"
          value={data.budget}
          icon={<Plane className="w-4 h-4" />}
          color="#d4af37"
          onChange={(v) => updateGoalField("december-trip", "budget", v)}
          prefix="₹"
        />
        <EditableMetric
          label="Amount Saved"
          value={data.savedAmount}
          icon={<Plane className="w-4 h-4" />}
          color="#22c55e"
          onChange={(v) => updateGoalField("december-trip", "savedAmount", v)}
          prefix="₹"
        />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Savings progress</span>
          <span className="text-[#22c55e] font-semibold">{savingsProgress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#1a1a1e] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#4ade80]"
            initial={{ width: 0 }}
            animate={{ width: `${savingsProgress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-6 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Trip Checklist</p>
        {data.checklist.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => toggleChecklistItem("december-trip", item.id)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-[#232329] bg-[#111113] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all group text-left"
          >
            {item.completed ? (
              <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-zinc-600 group-hover:text-[#d4af37] transition-colors shrink-0" />
            )}
            <span className={`text-sm ${item.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
