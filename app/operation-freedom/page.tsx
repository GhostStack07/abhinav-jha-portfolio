"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star, Calendar, BookOpen, BarChart3, Trophy, Image as ImageIcon,
} from "lucide-react";

import { HeroHeader } from "@/components/freedom/dashboard/hero-header";
import { GoalCard } from "@/components/freedom/dashboard/goal-card";
import { GoalModal } from "@/components/freedom/goals/goal-modal";
import { HabitTracker } from "@/components/freedom/habits/habit-tracker";
import { DailyJournal } from "@/components/freedom/journal/daily-journal";
import { AchievementsGrid } from "@/components/freedom/achievements/achievements-grid";
import { DashboardAnalytics } from "@/components/freedom/analytics/dashboard-analytics";
import { useAppStore } from "@/lib/freedom/store/app-store";
import type { GoalId } from "@/lib/freedom/types";

const GOALS: {
  id: GoalId;
  icon: string;
  name: string;
  getProgress: (s: ReturnType<typeof useAppStore.getState>) => number;
  getTarget: (s: ReturnType<typeof useAppStore.getState>) => number;
  getCurrent: (s: ReturnType<typeof useAppStore.getState>) => number;
  unit: string;
  accentColor?: string;
  estimatedCompletion?: Date;
}[] = [
  {
    id: "ai-engineer",
    icon: "🤖",
    name: "AI Engineer",
    getProgress: (s) => Math.round((s.goals["ai-engineer"].projects.filter((p) => p.completed).length / 10) * 100),
    getTarget: () => 10,
    getCurrent: (s) => s.goals["ai-engineer"].projects.filter((p) => p.completed).length,
    unit: "projects",
    accentColor: "#d4af37",
    estimatedCompletion: new Date("2026-09-01"),
  },
  {
    id: "ai-consultant",
    icon: "🧠",
    name: "AI Consultant",
    getProgress: (s) => Math.min(Math.round((s.goals["ai-consultant"].clients / 5) * 100), 100),
    getTarget: () => 5,
    getCurrent: (s) => s.goals["ai-consultant"].clients,
    unit: "clients",
    accentColor: "#3b82f6",
    estimatedCompletion: new Date("2026-10-01"),
  },
  {
    id: "wealth",
    icon: "💰",
    name: "₹30 Lakhs",
    getProgress: (s) => {
      const g = s.goals.wealth;
      const total = g.salary + g.sideHustleRevenue + g.investmentGrowth + g.savings;
      return Math.min(Math.round((total / g.targetAmount) * 100), 100);
    },
    getTarget: () => 3000000,
    getCurrent: (s) => {
      const g = s.goals.wealth;
      return g.salary + g.sideHustleRevenue + g.investmentGrowth + g.savings;
    },
    unit: "₹",
    accentColor: "#22c55e",
    estimatedCompletion: new Date("2026-12-01"),
  },
  {
    id: "fitness",
    icon: "💪",
    name: "Lean & Fit",
    getProgress: (s) => {
      const g = s.goals.fitness;
      const lost = Math.max(80 - g.currentWeight, 0);
      const total = 80 - g.goalWeight;
      return total > 0 ? Math.min(Math.round((lost / total) * 100), 100) : 0;
    },
    getTarget: (s) => s.goals.fitness.goalWeight,
    getCurrent: (s) => s.goals.fitness.currentWeight,
    unit: "kg goal",
    accentColor: "#f97316",
    estimatedCompletion: new Date("2026-11-01"),
  },
  {
    id: "swimming",
    icon: "🏊",
    name: "Swimming",
    getProgress: (s) => Math.round((s.goals.swimming.levels.filter((l) => l.completed).length / 6) * 100),
    getTarget: () => 6,
    getCurrent: (s) => s.goals.swimming.levels.filter((l) => l.completed).length,
    unit: "levels",
    accentColor: "#06b6d4",
    estimatedCompletion: new Date("2026-09-01"),
  },
  {
    id: "badminton",
    icon: "🏸",
    name: "Badminton",
    getProgress: (s) => Math.min(Math.round((s.goals.badminton.sessionsLog.reduce((a, b) => a + b.sessions, 0) / 24) * 100), 100),
    getTarget: () => 24,
    getCurrent: (s) => s.goals.badminton.sessionsLog.reduce((a, b) => a + b.sessions, 0),
    unit: "sessions",
    accentColor: "#a855f7",
    estimatedCompletion: new Date("2026-12-01"),
  },
  {
    id: "drone",
    icon: "🚁",
    name: "Drone Pilot",
    getProgress: (s) => Math.round((s.goals.drone.checklist.filter((d) => d.completed).length / 7) * 100),
    getTarget: () => 7,
    getCurrent: (s) => s.goals.drone.checklist.filter((d) => d.completed).length,
    unit: "steps",
    accentColor: "#ef4444",
    estimatedCompletion: new Date("2026-10-01"),
  },
  {
    id: "director",
    icon: "🎯",
    name: "Director",
    getProgress: (s) => s.goals.director.promotionReadiness,
    getTarget: () => 100,
    getCurrent: (s) => s.goals.director.promotionReadiness,
    unit: "% ready",
    accentColor: "#d4af37",
    estimatedCompletion: new Date("2026-12-01"),
  },
  {
    id: "december-trip",
    icon: "✈️",
    name: "December Trip",
    getProgress: (s) => Math.round((s.goals["december-trip"].checklist.filter((c) => c.completed).length / 6) * 100),
    getTarget: () => 6,
    getCurrent: (s) => s.goals["december-trip"].checklist.filter((c) => c.completed).length,
    unit: "tasks",
    accentColor: "#06b6d4",
    estimatedCompletion: new Date("2026-12-15"),
  },
  {
    id: "side-hustle",
    icon: "🚀",
    name: "Side Hustle",
    getProgress: (s) => Math.round((s.goals["side-hustle"].checklist.filter((c) => c.completed).length / 4) * 100),
    getTarget: () => 4,
    getCurrent: (s) => s.goals["side-hustle"].checklist.filter((c) => c.completed).length,
    unit: "milestones",
    accentColor: "#22c55e",
    estimatedCompletion: new Date("2026-08-01"),
  },
  {
    id: "book-reading",
    icon: "📚",
    name: "Book Reading",
    getProgress: (s) => {
      const g = s.goals["book-reading"];
      return Math.min(Math.round((g.books.filter((b) => b.completed).length / g.targetBooks) * 100), 100);
    },
    getTarget: (s) => s.goals["book-reading"].targetBooks,
    getCurrent: (s) => s.goals["book-reading"].books.filter((b) => b.completed).length,
    unit: "books",
    accentColor: "#ec4899",
    estimatedCompletion: new Date("2026-12-01"),
  },
];

const TABS = [
  { id: "goals" as const, label: "Goals", icon: <Star className="w-4 h-4" /> },
  { id: "habits" as const, label: "Habits", icon: <Calendar className="w-4 h-4" /> },
  { id: "journal" as const, label: "Journal", icon: <BookOpen className="w-4 h-4" /> },
  { id: "analytics" as const, label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "achievements" as const, label: "Achievements", icon: <Trophy className="w-4 h-4" /> },
  { id: "vision" as const, label: "Vision Board", icon: <ImageIcon className="w-4 h-4" /> },
];

type Tab = (typeof TABS)[number]["id"];

function FreedomContent() {
  const storeState = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeGoal, setActiveGoal] = useState<GoalId | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("goals");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const goalParam = searchParams.get("goal") as GoalId | null;
    const tabParam = searchParams.get("tab") as Tab | null;
    if (goalParam) { setActiveGoal(goalParam); setActiveTab("goals"); }
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams, mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#09090b]">
      <HeroHeader />

      {/* Tab navigation */}
      <div className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-b border-[#232329]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav
            className="flex gap-1 overflow-x-auto py-2"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {activeTab === "goals" && (
          <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {GOALS.map((goal, i) => (
                <GoalCard
                  key={goal.id}
                  id={goal.id}
                  icon={goal.icon}
                  name={goal.name}
                  progress={goal.getProgress(storeState)}
                  target={goal.getTarget(storeState)}
                  current={goal.getCurrent(storeState)}
                  unit={goal.unit}
                  accentColor={goal.accentColor}
                  estimatedCompletion={goal.estimatedCompletion}
                  onClick={() => setActiveGoal(goal.id)}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "habits" && (
          <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <HabitTracker />
          </motion.div>
        )}

        {activeTab === "journal" && (
          <motion.div key="journal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DailyJournal />
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DashboardAnalytics />
          </motion.div>
        )}

        {activeTab === "achievements" && (
          <motion.div key="achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AchievementsGrid />
          </motion.div>
        )}

        {activeTab === "vision" && (
          <motion.div key="vision" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <VisionBoard />
          </motion.div>
        )}
      </main>

      <GoalModal goalId={activeGoal} onClose={() => { setActiveGoal(null); router.replace("/operation-freedom"); }} />
    </div>
  );
}

export default function OperationFreedomPage() {
  return (
    <Suspense>
      <FreedomContent />
    </Suspense>
  );
}

function VisionBoard() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))}
          className="w-9 h-9 rounded-lg border border-[#232329] flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#d4af37]/50 transition-colors text-lg"
        >−</button>
        <span className="text-sm text-zinc-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(1)))}
          className="w-9 h-9 rounded-lg border border-[#232329] flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#d4af37]/50 transition-colors text-lg"
        >+</button>
      </div>
      <div className="overflow-auto w-full flex justify-center">
        <motion.div
          animate={{ scale: zoom }}
          transition={{ duration: 0.2 }}
          className="origin-top w-full max-w-4xl"
        >
          <div
            className="rounded-3xl border border-[#d4af37]/20 bg-gradient-to-br from-[#111113] via-[#0d0d0f] to-[#111113] p-12 text-center"
            style={{ boxShadow: "0 0 80px rgba(212,175,55,0.08)" }}
          >
            <div className="text-6xl mb-6">🌟</div>
            <h1 className="text-5xl font-black gold-gradient mb-4">VISION 2026</h1>
            <p className="text-zinc-400 text-xl mb-12">This is what freedom looks like.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-left">
              {[
                { emoji: "🤖", title: "AI Engineer", desc: "10 live AI projects. Real impact." },
                { emoji: "🧠", title: "AI Consultant", desc: "5 paying clients. Known expert." },
                { emoji: "💰", title: "Financial Free", desc: "₹30 Lakhs in 6 months." },
                { emoji: "💪", title: "Peak Body", desc: "Lean, strong, confident." },
                { emoji: "🏊", title: "Ocean Ready", desc: "Swimming 1000m strong." },
                { emoji: "✈️", title: "World Traveler", desc: "December international trip." },
                { emoji: "🚁", title: "Drone Pilot", desc: "DGCA certified pilot." },
                { emoji: "🎯", title: "Director Level", desc: "Leading teams. Creating impact." },
                { emoji: "🚀", title: "Entrepreneur", desc: "Side hustle earning MRR." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-2xl border border-[#232329] bg-[#111113]/50 hover:border-[#d4af37]/30 transition-colors"
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <h3 className="text-sm font-bold text-[#d4af37]">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-12 text-sm text-zinc-600 italic">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
