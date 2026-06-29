"use client";

import { motion } from "framer-motion";
import { format, subDays, isSameDay } from "date-fns";
import { Brain, BookOpen, Dumbbell, Zap, Droplets, Moon, PenLine } from "lucide-react";
import { useAppStore } from "@/lib/freedom/store/app-store";
import type { HabitEntry } from "@/lib/freedom/types";

const HABITS: { key: keyof Omit<HabitEntry, "date">; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "meditation", label: "Meditation", icon: <Brain className="w-4 h-4" />, color: "#a855f7" },
  { key: "reading", label: "Reading", icon: <BookOpen className="w-4 h-4" />, color: "#3b82f6" },
  { key: "workout", label: "Workout", icon: <Dumbbell className="w-4 h-4" />, color: "#22c55e" },
  { key: "deepWork", label: "Deep Work", icon: <Zap className="w-4 h-4" />, color: "#d4af37" },
  { key: "water", label: "3L Water", icon: <Droplets className="w-4 h-4" />, color: "#06b6d4" },
  { key: "sleep", label: "8h Sleep", icon: <Moon className="w-4 h-4" />, color: "#6366f1" },
  { key: "journal", label: "Journal", icon: <PenLine className="w-4 h-4" />, color: "#f97316" },
];

export function HabitTracker() {
  const { habits, toggleHabit, getHabitEntry } = useAppStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = getHabitEntry(today);

  // Build 10-week heatmap
  const days = Array.from({ length: 70 }, (_, i) => {
    const date = subDays(new Date(), 69 - i);
    const key = format(date, "yyyy-MM-dd");
    const entry = habits.find((h) => h.date === key);
    const completedCount = entry
      ? HABITS.filter((h) => entry[h.key]).length
      : 0;
    return { date, key, completedCount };
  });

  return (
    <div className="space-y-8">
      {/* Today's habits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Today's Habits</h3>
          <span className="text-xs text-zinc-600">{format(new Date(), "MMM d, yyyy")}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HABITS.map((habit, i) => {
            const done = todayEntry?.[habit.key] ?? false;
            return (
              <motion.button
                key={habit.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggleHabit(today, habit.key)}
                className="relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-200 group"
                style={{
                  borderColor: done ? `${habit.color}40` : "#232329",
                  background: done ? `${habit.color}10` : "#111113",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: done ? `${habit.color}20` : "#1a1a1e",
                    color: done ? habit.color : "#71717a",
                    boxShadow: done ? `0 0 16px ${habit.color}30` : "none",
                  }}
                >
                  {habit.icon}
                </div>
                <span className="text-xs font-medium" style={{ color: done ? habit.color : "#71717a" }}>
                  {habit.label}
                </span>
                {done && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center text-[10px] text-black font-bold"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Activity Heatmap — Last 70 Days
        </h3>
        <div className="flex gap-1.5 flex-wrap">
          {days.map(({ date, key, completedCount }, i) => {
            const isToday = isSameDay(date, new Date());
            const opacity =
              completedCount === 0 ? 0 :
              completedCount <= 2 ? 0.25 :
              completedCount <= 4 ? 0.55 :
              completedCount <= 6 ? 0.8 : 1;

            return (
              <div
                key={key}
                title={`${format(date, "MMM d")}: ${completedCount}/7 habits`}
                className="heatmap-cell w-6 h-6 rounded-md"
                style={{
                  background: completedCount > 0 ? `rgba(212, 175, 55, ${opacity})` : "#1a1a1e",
                  border: isToday ? "1px solid #d4af37" : "1px solid transparent",
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-600">
          <span>0 habits</span>
          <div className="flex gap-1">
            {[0.15, 0.35, 0.6, 0.85, 1].map((o, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(212,175,55,${o})` }} />
            ))}
          </div>
          <span>7/7</span>
        </div>
      </div>
    </div>
  );
}
