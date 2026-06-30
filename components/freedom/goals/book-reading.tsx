"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Circle, Plus, X, Flame, BookMarked } from "lucide-react";
import { useAppStore } from "@/lib/freedom/store/app-store";
import { nanoid } from "@/lib/freedom/utils";
import { ModalHeader } from "./modal-header";
import { EditableMetric } from "./editable-metric";

export function BookReadingModal({ onClose: _ }: { onClose: () => void }) {
  const { goals, updateGoalField, toggleChecklistItem } = useAppStore();
  const data = goals["book-reading"];
  const [newTitle, setNewTitle] = useState("");

  const completedBooks = data.books.filter((b) => b.completed).length;
  const progress = Math.min(Math.round((completedBooks / data.targetBooks) * 100), 100);

  const addBook = () => {
    const title = newTitle.trim();
    if (!title) return;
    updateGoalField("book-reading", "books", [
      ...data.books,
      { id: nanoid(), title, completed: false },
    ]);
    setNewTitle("");
  };

  const removeBook = (id: string) => {
    updateGoalField(
      "book-reading",
      "books",
      data.books.filter((b) => b.id !== id)
    );
  };

  // ~20 pages/day clears a ~280pg book in 2 weeks → 2 books/month
  const daysPerBook = data.dailyPageGoal > 0 ? Math.ceil(280 / data.dailyPageGoal) : 14;

  return (
    <div className="p-8">
      <ModalHeader
        icon={<BookOpen className="w-6 h-6 text-[#d4af37]" />}
        title="Book Reading"
        subtitle="Steady pace beats binge reading"
        progress={progress}
        current={completedBooks}
        target={data.targetBooks}
        unit="books"
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        <EditableMetric
          label="Target Books (6mo)"
          value={data.targetBooks}
          icon={<BookMarked className="w-4 h-4" />}
          color="#d4af37"
          onChange={(v) => updateGoalField("book-reading", "targetBooks", Math.max(1, v))}
          suffix="books"
        />
        <EditableMetric
          label="Daily Page Goal"
          value={data.dailyPageGoal}
          icon={<BookOpen className="w-4 h-4" />}
          color="#3b82f6"
          onChange={(v) => updateGoalField("book-reading", "dailyPageGoal", Math.max(1, v))}
          suffix="pages/day"
        />
        <EditableMetric
          label="Pages Read Today"
          value={data.pagesReadToday}
          icon={<BookOpen className="w-4 h-4" />}
          color="#22c55e"
          onChange={(v) => updateGoalField("book-reading", "pagesReadToday", v)}
          suffix="pages"
        />
        <EditableMetric
          label="Total Pages Read"
          value={data.totalPagesRead}
          icon={<BookOpen className="w-4 h-4" />}
          color="#a855f7"
          onChange={(v) => updateGoalField("book-reading", "totalPagesRead", v)}
          suffix="pages"
        />
        <EditableMetric
          label="Reading Streak"
          value={data.readingStreak}
          icon={<Flame className="w-4 h-4" />}
          color="#ef4444"
          onChange={(v) => updateGoalField("book-reading", "readingStreak", v)}
          suffix="days 🔥"
        />
      </div>

      {/* Pace insight */}
      <div className="mt-6 p-4 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/20">
        <p className="text-xs text-zinc-400">
          At <span className="text-[#d4af37] font-semibold">{data.dailyPageGoal} pages/day</span>,
          an average book (~280pg) takes about{" "}
          <span className="text-white font-semibold">{daysPerBook} days</span>. That paces out to{" "}
          <span className="text-[#d4af37] font-semibold">{data.targetBooks} books</span> over 6 months —
          no need to rush, just stay consistent.
        </p>
      </div>

      {/* Add book */}
      <div className="mt-8 flex gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addBook()}
          placeholder="Add a book title…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#232329] bg-[#111113] text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#d4af37]/50 transition-colors"
        />
        <button
          onClick={addBook}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#f5d97a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Book list */}
      <div className="mt-6 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Reading List</p>
        {data.books.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No books added yet. Add your first one above.
          </div>
        ) : (
          data.books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border border-[#232329] bg-[#111113] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all group"
            >
              <button onClick={() => toggleChecklistItem("book-reading", book.id)} className="shrink-0">
                {book.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600 group-hover:text-[#d4af37] transition-colors" />
                )}
              </button>
              <span
                className={`flex-1 text-sm text-left ${
                  book.completed ? "line-through text-zinc-500" : "text-zinc-200"
                }`}
              >
                {book.title}
              </span>
              <button
                onClick={() => removeBook(book.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-[#ef4444]"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
