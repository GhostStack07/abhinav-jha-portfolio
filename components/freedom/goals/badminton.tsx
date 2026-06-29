"use client";

import { useState } from "react";
import { Swords, Plus } from "lucide-react";
import { format, startOfWeek, addDays, subWeeks, isSameDay } from "date-fns";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { ModalHeader } from "./modal-header";

export function BadmintonModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, updateGoalField } = useAppStore();
  const data = goals.badminton;
  const [logDate, setLogDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const totalSessions = data.sessionsLog.reduce((a, b) => a + b.sessions, 0);
  const target = 24; // 2/week × 12 weeks
  const progress = Math.min(Math.round((totalSessions / target) * 100), 100);

  const addSession = () => {
    const existing = data.sessionsLog.find((s) => s.date === logDate);
    let updated;
    if (existing) {
      updated = data.sessionsLog.map((s) =>
        s.date === logDate ? { ...s, sessions: s.sessions + 1 } : s
      );
    } else {
      updated = [...data.sessionsLog, { date: logDate, sessions: 1 }];
    }
    updateGoalField("badminton", "sessionsLog", updated);
  };

  // Build 8-week heatmap
  const today = new Date();
  const weeks = Array.from({ length: 8 }, (_, wi) => {
    const weekStart = startOfWeek(subWeeks(today, 7 - wi), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, di) => addDays(weekStart, di));
  });

  const getSessionsForDate = (date: Date) => {
    const key = format(date, "yyyy-MM-dd");
    return data.sessionsLog.find((s) => s.date === key)?.sessions ?? 0;
  };

  return (
    <div className="p-8">
      <ModalHeader
        icon={<Swords className="w-6 h-6 text-[#d4af37]" />}
        title="Badminton"
        subtitle="2 sessions per week target"
        progress={progress}
        current={totalSessions}
        target={target}
        unit="sessions"
      />

      {/* Log session */}
      <div className="mt-8 flex gap-3">
        <input
          type="date"
          value={logDate}
          onChange={(e) => setLogDate(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#232329] bg-[#111113] text-sm text-white outline-none focus:border-[#d4af37]/50"
        />
        <button
          onClick={addSession}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#f5d97a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Session
        </button>
      </div>

      {/* Calendar heatmap */}
      <div className="mt-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Activity Heatmap</p>
        <div className="flex gap-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              {week.map((day, di) => {
                const sessions = getSessionsForDate(day);
                const isToday = isSameDay(day, today);
                const isFuture = day > today;
                return (
                  <div
                    key={di}
                    title={`${format(day, "MMM d")}: ${sessions} sessions`}
                    className={`w-8 h-8 rounded-md heatmap-cell flex items-center justify-center text-xs font-bold ${isFuture ? "opacity-20" : ""}`}
                    style={{
                      background:
                        sessions >= 2
                          ? "#d4af37"
                          : sessions === 1
                          ? "#d4af3760"
                          : "#1a1a1e",
                      border: isToday ? "1px solid #d4af37" : "1px solid transparent",
                      color: sessions > 0 ? "#09090b" : "transparent",
                    }}
                  >
                    {sessions > 0 ? sessions : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-600">
          <span>Less</span>
          <div className="flex gap-1">
            {["#1a1a1e", "#d4af3640", "#d4af3780", "#d4af37"].map((c) => (
              <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
