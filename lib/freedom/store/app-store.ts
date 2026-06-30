"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, GoalId, HabitEntry, JournalEntry, ChecklistItem } from "@/lib/freedom/types";
import { INITIAL_STATE } from "@/lib/freedom/data/initial-state";

interface AppStore extends AppState {
  toggleChecklistItem: (goalId: GoalId, itemId: string) => void;
  updateGoalField: <T extends GoalId>(goalId: T, field: string, value: unknown) => void;
  updateNestedGoalField: <T extends GoalId>(goalId: T, path: string[], value: unknown) => void;
  toggleHabit: (date: string, habit: keyof Omit<HabitEntry, "date">) => void;
  getHabitEntry: (date: string) => HabitEntry | undefined;
  saveJournalEntry: (entry: JournalEntry) => void;
  getJournalEntry: (date: string) => JournalEntry | undefined;
  unlockAchievement: (id: string) => void;
  recalculateMission: () => void;
}

// ─── Mission progress ────────────────────────────────────────────────────────

function computeMissionProgress(state: AppState): number {
  let total = 0;
  let completed = 0;

  const aiProjects = state.goals["ai-engineer"].projects;
  total += aiProjects.length;
  completed += aiProjects.filter((p) => p.completed).length;

  total += 5;
  completed += Math.min(state.goals["ai-consultant"].clients, 5);

  total += 10;
  const wealthPct = Math.min(
    (state.goals.wealth.salary + state.goals.wealth.sideHustleRevenue +
      state.goals.wealth.investmentGrowth + state.goals.wealth.savings) /
      state.goals.wealth.targetAmount, 1
  );
  completed += Math.round(wealthPct * 10);

  const fitness = state.goals.fitness;
  const startWeight = INITIAL_STATE.goals.fitness.currentWeight;
  const weightPct =
    fitness.currentWeight < startWeight
      ? Math.min((startWeight - fitness.currentWeight) / (startWeight - fitness.goalWeight), 1)
      : 0;
  total += 5;
  completed += Math.round(weightPct * 5);

  const swimLevels = state.goals.swimming.levels;
  total += swimLevels.length;
  completed += swimLevels.filter((l) => l.completed).length;

  total += 24;
  completed += Math.min(state.goals.badminton.sessionsLog.reduce((a, b) => a + b.sessions, 0), 24);

  const drone = state.goals.drone.checklist;
  total += drone.length;
  completed += drone.filter((d) => d.completed).length;

  total += 10;
  completed += Math.round((state.goals.director.promotionReadiness / 100) * 10);

  const trip = state.goals["december-trip"].checklist;
  total += trip.length;
  completed += trip.filter((t) => t.completed).length;

  const sh = state.goals["side-hustle"].checklist;
  total += sh.length;
  completed += sh.filter((s) => s.completed).length;

  const br = state.goals["book-reading"];
  if (br) {
    total += 10;
    completed += Math.round(
      Math.min(br.books.filter((b) => b.completed).length / (br.targetBooks || 1), 1) * 10
    );
  }

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// ─── Achievement auto-unlock ─────────────────────────────────────────────────

function getAchievementsToUnlock(state: AppState): string[] {
  const ids: string[] = [];
  const g = state.goals;
  const br = g["book-reading"];

  // Career
  if (g["ai-engineer"].projects.some((p) => p.completed)) ids.push("first-ai-project");
  if (g["ai-consultant"].clients >= 1) ids.push("first-client");
  if (g["ai-consultant"].linkedinFollowers >= 100) ids.push("100-linkedin");
  if (g["side-hustle"].checklist.find((c) => c.id === "website")?.completed) ids.push("side-hustle-launched");
  if (g.director.promotionReadiness >= 80) ids.push("director");

  // Wealth
  const totalWealth = g.wealth.salary + g.wealth.sideHustleRevenue + g.wealth.investmentGrowth + g.wealth.savings;
  if (totalWealth >= 100000) ids.push("1l-earned");

  // Fitness & Sport
  if (g.fitness.gymSessions >= 10) ids.push("10-workouts");
  if (g.swimming.levels.find((l) => l.id === "500m")?.completed) ids.push("swimming-500m");
  if (g.badminton.sessionsLog.reduce((a, b) => a + b.sessions, 0) >= 24) ids.push("smash-master");

  // Learning
  if (br?.books.some((b) => b.completed)) ids.push("first-book");
  if ((br?.readingStreak ?? 0) >= 5) ids.push("reading-streak-5");

  // Lifestyle
  if (state.journal.length >= 1) ids.push("first-journal");
  const HABIT_KEYS: (keyof Omit<HabitEntry, "date">)[] = [
    "meditation", "reading", "workout", "deepWork", "water", "sleep", "journal",
  ];
  if (state.habits.some((h) => HABIT_KEYS.every((k) => h[k]))) ids.push("morning-warrior");

  // Mission
  if (state.missionProgress >= 50) ids.push("halfway-there");
  if (g.drone.checklist.find((d) => d.id === "license")?.completed) ids.push("drone-certified");
  if (g["december-trip"].checklist.every((c) => c.completed) && g["december-trip"].checklist.length > 0) ids.push("wanderlust");

  return ids;
}

function applyAchievements(achievements: AppState["achievements"], toUnlock: string[]): AppState["achievements"] {
  const now = new Date().toISOString();
  return achievements.map((a) =>
    !a.unlocked && toUnlock.includes(a.id)
      ? { ...a, unlocked: true, unlockedAt: now }
      : a
  );
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      toggleChecklistItem: (goalId, itemId) => {
        set((state) => {
          const goal = state.goals[goalId] as unknown as Record<string, unknown>;
          for (const key of Object.keys(goal)) {
            const field = goal[key];
            if (Array.isArray(field) && field[0] && "id" in field[0]) {
              const updated = (field as ChecklistItem[]).map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              );
              const newGoals = { ...state.goals, [goalId]: { ...goal, [key]: updated } };
              const progress = computeMissionProgress({ ...state, goals: newGoals });
              const nextState = { ...state, goals: newGoals, missionProgress: progress };
              return {
                goals: newGoals,
                missionProgress: progress,
                achievements: applyAchievements(state.achievements, getAchievementsToUnlock(nextState)),
              };
            }
          }
          return state;
        });
      },

      updateGoalField: (goalId, field, value) => {
        set((state) => {
          const newGoals = {
            ...state.goals,
            [goalId]: { ...state.goals[goalId], [field]: value },
          };
          const progress = computeMissionProgress({ ...state, goals: newGoals });
          const nextState = { ...state, goals: newGoals, missionProgress: progress };
          return {
            goals: newGoals,
            missionProgress: progress,
            achievements: applyAchievements(state.achievements, getAchievementsToUnlock(nextState)),
          };
        });
      },

      updateNestedGoalField: (goalId, path, value) => {
        set((state) => {
          const goal = { ...state.goals[goalId] } as Record<string, unknown>;
          let cur = goal;
          for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]] as Record<string, unknown>;
          cur[path[path.length - 1]] = value;
          const newGoals = { ...state.goals, [goalId]: goal };
          const progress = computeMissionProgress({ ...state, goals: newGoals });
          const nextState = { ...state, goals: newGoals, missionProgress: progress };
          return {
            goals: newGoals,
            missionProgress: progress,
            achievements: applyAchievements(state.achievements, getAchievementsToUnlock(nextState)),
          };
        });
      },

      toggleHabit: (date, habit) => {
        set((state) => {
          const existing = state.habits.find((h) => h.date === date);
          let newHabits: HabitEntry[];
          if (existing) {
            newHabits = state.habits.map((h) =>
              h.date === date ? { ...h, [habit]: !h[habit] } : h
            );
          } else {
            const entry: HabitEntry = {
              date, meditation: false, reading: false, workout: false,
              deepWork: false, water: false, sleep: false, journal: false,
              [habit]: true,
            };
            newHabits = [...state.habits, entry];
          }
          const nextState = { ...state, habits: newHabits };
          return {
            habits: newHabits,
            achievements: applyAchievements(state.achievements, getAchievementsToUnlock(nextState)),
          };
        });
      },

      getHabitEntry: (date) => get().habits.find((h) => h.date === date),

      saveJournalEntry: (entry) => {
        set((state) => {
          const exists = state.journal.find((j) => j.date === entry.date);
          const newJournal = exists
            ? state.journal.map((j) => (j.date === entry.date ? entry : j))
            : [...state.journal, entry];
          const nextState = { ...state, journal: newJournal };
          return {
            journal: newJournal,
            achievements: applyAchievements(state.achievements, getAchievementsToUnlock(nextState)),
          };
        });
      },

      getJournalEntry: (date) => get().journal.find((j) => j.date === date),

      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id && !a.unlocked
              ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() }
              : a
          ),
        }));
      },

      recalculateMission: () => {
        set((state) => ({
          missionProgress: computeMissionProgress(state),
        }));
      },
    }),
    {
      name: "freedom-2026-storage",
      version: 3,
      migrate: (stored: unknown, version: number) => {
        const s = stored as Record<string, unknown> & { goals?: Record<string, unknown>; achievements?: unknown[] };
        let out = { ...s };

        // v1 → v2: add book-reading goal
        if (version < 2) {
          out = {
            ...out,
            goals: { ...out.goals, "book-reading": INITIAL_STATE.goals["book-reading"] },
          };
        }

        // v2 → v3: add new achievements (merge so existing unlocked state is kept)
        if (version < 3) {
          const existingIds = new Set((out.achievements ?? []).map((a: any) => a.id));
          const newAchievements = INITIAL_STATE.achievements.filter((a) => !existingIds.has(a.id));
          out = { ...out, achievements: [...(out.achievements ?? []), ...newAchievements] };
        }

        return out;
      },
    }
  )
);
