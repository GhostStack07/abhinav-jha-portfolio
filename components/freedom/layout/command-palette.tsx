"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Users, DollarSign, Dumbbell, Waves, Swords, Radio,
  Star, Plane, Rocket, Calendar, BookOpen, Target, Trophy,
} from "lucide-react";

const BASE = "/operation-freedom";

const COMMANDS = [
  { id: "dashboard", label: "Dashboard", icon: Target, href: BASE },
  { id: "ai-engineer", label: "AI Engineer Goal", icon: Bot, href: `${BASE}?goal=ai-engineer` },
  { id: "ai-consultant", label: "AI Consultant Goal", icon: Users, href: `${BASE}?goal=ai-consultant` },
  { id: "wealth", label: "₹30 Lakhs Goal", icon: DollarSign, href: `${BASE}?goal=wealth` },
  { id: "fitness", label: "Lean & Fit Goal", icon: Dumbbell, href: `${BASE}?goal=fitness` },
  { id: "swimming", label: "Swimming Goal", icon: Waves, href: `${BASE}?goal=swimming` },
  { id: "badminton", label: "Badminton Goal", icon: Swords, href: `${BASE}?goal=badminton` },
  { id: "drone", label: "Drone Pilot Goal", icon: Radio, href: `${BASE}?goal=drone` },
  { id: "director", label: "Director Goal", icon: Star, href: `${BASE}?goal=director` },
  { id: "december-trip", label: "December Trip Goal", icon: Plane, href: `${BASE}?goal=december-trip` },
  { id: "side-hustle", label: "Side Hustle Goal", icon: Rocket, href: `${BASE}?goal=side-hustle` },
  { id: "book-reading", label: "Book Reading Goal", icon: BookOpen, href: `${BASE}?goal=book-reading` },
  { id: "habits", label: "Habit Tracker", icon: Calendar, href: `${BASE}?tab=habits` },
  { id: "journal", label: "Daily Journal", icon: BookOpen, href: `${BASE}?tab=journal` },
  { id: "achievements", label: "Achievements", icon: Trophy, href: `${BASE}?tab=achievements` },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <Command className="glass border border-[#232329] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center border-b border-[#232329] px-4">
                <Target className="w-4 h-4 text-[#d4af37] shrink-0 mr-3" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search goals, habits, journal…"
                  className="flex-1 bg-transparent py-4 text-sm text-white placeholder:text-zinc-500 outline-none"
                />
                <kbd className="text-xs text-zinc-600 border border-[#232329] rounded px-1.5 py-0.5">ESC</kbd>
              </div>
              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-zinc-500">
                  No results found.
                </Command.Empty>
                {filtered.map((cmd) => (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={() => {
                      router.push(cmd.href);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-zinc-300 hover:bg-[#d4af37]/10 hover:text-[#d4af37] data-[selected=true]:bg-[#d4af37]/10 data-[selected=true]:text-[#d4af37] transition-colors"
                  >
                    <cmd.icon className="w-4 h-4 shrink-0" />
                    {cmd.label}
                  </Command.Item>
                ))}
              </Command.List>
              <div className="border-t border-[#232329] px-4 py-2 flex items-center gap-4 text-xs text-zinc-600">
                <span><kbd className="border border-[#232329] rounded px-1">↑↓</kbd> navigate</span>
                <span><kbd className="border border-[#232329] rounded px-1">↵</kbd> select</span>
                <span><kbd className="border border-[#232329] rounded px-1">⌘K</kbd> toggle</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
