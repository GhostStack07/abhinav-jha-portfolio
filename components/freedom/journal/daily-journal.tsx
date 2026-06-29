"use client";

import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { PenLine, Save, Smile } from "lucide-react";
import { useAppStore } from "@/lib/freedom/store/app-store";
import type { JournalEntry } from "@/lib/freedom/types";
import { nanoid } from "@/lib/freedom/utils";

const MOODS = [
  { value: 1, emoji: "😔", label: "Low" },
  { value: 2, emoji: "😐", label: "Okay" },
  { value: 3, emoji: "🙂", label: "Good" },
  { value: 4, emoji: "😊", label: "Great" },
  { value: 5, emoji: "🔥", label: "Amazing" },
] as const;

type FormData = {
  todaysWin: string;
  tomorrowsPriority: string;
  lessonsLearned: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
};

export function DailyJournal() {
  const { saveJournalEntry, getJournalEntry, journal } = useAppStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const existing = getJournalEntry(today);

  const [saved, setSaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: existing
      ? {
          todaysWin: existing.todaysWin,
          tomorrowsPriority: existing.tomorrowsPriority,
          lessonsLearned: existing.lessonsLearned,
          mood: existing.mood,
          energy: existing.energy,
        }
      : { mood: 3, energy: 3 },
  });

  const mood = watch("mood");
  const energy = watch("energy");

  const onSubmit = (data: FormData) => {
    saveJournalEntry({
      id: existing?.id ?? nanoid(),
      date: today,
      ...data,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pastEntries = journal
    .filter((j) => j.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Write form */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <PenLine className="w-5 h-5 text-[#d4af37]" />
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Daily Reflection</h3>
          <span className="ml-auto text-xs text-zinc-600">{format(new Date(), "EEEE, MMM d")}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Today's Win 🏆</label>
            <textarea
              {...register("todaysWin")}
              placeholder="What did you accomplish today?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#232329] bg-[#111113] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#d4af37]/50 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Tomorrow's Priority 🎯</label>
            <textarea
              {...register("tomorrowsPriority")}
              placeholder="What's the #1 thing to do tomorrow?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-[#232329] bg-[#111113] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#d4af37]/50 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Lessons Learned 💡</label>
            <textarea
              {...register("lessonsLearned")}
              placeholder="What did you learn today?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-[#232329] bg-[#111113] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#d4af37]/50 resize-none transition-colors"
            />
          </div>

          {/* Mood & Energy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">Mood</label>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setValue("mood", m.value)}
                    title={m.label}
                    className={`w-9 h-9 rounded-xl text-lg transition-all duration-150 ${
                      mood === m.value
                        ? "bg-[#d4af37]/20 border border-[#d4af37]/40 scale-110"
                        : "bg-[#111113] border border-[#232329] hover:scale-105"
                    }`}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">Energy</label>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setValue("energy", m.value)}
                    title={m.label}
                    className={`w-9 h-9 rounded-xl text-lg transition-all duration-150 ${
                      energy === m.value
                        ? "bg-[#d4af37]/20 border border-[#d4af37]/40 scale-110"
                        : "bg-[#111113] border border-[#232329] hover:scale-105"
                    }`}
                  >
                    {"⚡".repeat(m.value > 3 ? 2 : 1)}
                    {m.value <= 2 ? "💤" : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d4af37] text-black font-semibold text-sm hover:bg-[#f5d97a] transition-colors"
          >
            {saved ? (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-black"
              >
                ✓ Saved!
              </motion.span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Reflection
              </>
            )}
          </button>
        </form>
      </div>

      {/* Past entries */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Past Reflections</h3>
        {pastEntries.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            <PenLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No past entries yet.
          </div>
        ) : (
          <div className="space-y-3">
            {pastEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl border border-[#232329] bg-[#111113] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">
                    {format(new Date(entry.date), "MMM d, yyyy")}
                  </span>
                  <span className="text-lg">
                    {MOODS.find((m) => m.value === entry.mood)?.emoji}
                  </span>
                </div>
                {entry.todaysWin && (
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    <span className="text-[#d4af37]">Win:</span> {entry.todaysWin}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
