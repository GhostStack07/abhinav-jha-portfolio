"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, GoalId, HabitEntry, JournalEntry, ChecklistItem } from "@/lib/freedom/types";
import { INITIAL_STATE } from "@/lib/freedom/data/initial-state";

interface AppStore extends AppState {
  // Goal actions
  toggleChecklistItem: (goalId: GoalId, itemId: string) => void;
  updateGoalField: <T extends GoalId>(goalId: T, field: string, value: unknown) => void;
  updateNestedGoalField: <T extends GoalId>(goalId: T, path: string[], value: unknown) => void;

  // Habit actions
  toggleHabit: (date: string, habit: keyof Omit<HabitEntry, "date">) => void;
  getHabitEntry: (date: string) => HabitEntry | undefined;

  // Journal actions
  saveJournalEntry: (entry: JournalEntry) => void;
  getJournalEntry: (date: string) => JournalEntry | undefined;

  // Achievement actions
  unlockAchievement: (id: string) => void;

  // Computed
  recalculateMission: () => void;
}

function computeMissionProgress(state: AppState): number {
  let total = 0;
  let completed = 0;

  // AI Engineer: 10 projects
  const aiProjects = state.goals["ai-engineer"].projects;
  total += aiProjects.length;
  completed += aiProjects.filter((p) => p.completed).length;

  // AI Consultant: 5 clients
  total += 5;
  completed += Math.min(state.goals["ai-consultant"].clients, 5);

  // Wealth: target ₹30L
  total += 10;
  const wealthPct = Math.min(
    (state.goals.wealth.salary + state.goals.wealth.sideHustleRevenue + state.goals.wealth.investmentGrowth + state.goals.wealth.savings) /
      state.goals.wealth.targetAmount,
    1
  );
  completed += Math.round(wealthPct * 10);

  // Fitness: weight loss goal
  const fitness = state.goals.fitness;
  const weightRange = fitness.currentWeight - fitness.goalWeight;
  const startWeight = INITIAL_STATE.goals.fitness.currentWeight;
  const weightPct = weightRange > 0 ? Math.min((startWeight - fitness.currentWeight) / (startWeight - fitness.goalWeight), 1) : 0;
  total += 5;
  completed += Math.round(weightPct * 5);

  // Swimming: 6 levels
  const swimLevels = state.goals.swimming.levels;
  total += swimLevels.length;
  completed += swimLevels.filter((l) => l.completed).length;

  // Badminton: 24 sessions (2/week × 12 weeks)
  total += 24;
  completed += Math.min(state.goals.badminton.sessionsLog.reduce((a, b) => a + b.sessions, 0), 24);

  // Drone: 7 items
  const drone = state.goals.drone.checklist;
  total += drone.length;
  completed += drone.filter((d) => d.completed).length;

  // Director: promotion readiness
  total += 10;
  completed += Math.round((state.goals.director.promotionReadiness / 100) * 10);

  // December Trip: 6 checklist items
  const trip = state.goals["december-trip"].checklist;
  total += trip.length;
  completed += trip.filter((t) => t.completed).length;

  // Side Hustle: 4 checklist + MRR
  const sh = state.goals["side-hustle"].checklist;
  total += sh.length;
  completed += sh.filter((s) => s.completed).length;

  // Book Reading: books finished vs target (12 over 6 months)
  const br = state.goals["book-reading"];
  total += 10;
  completed += Math.round(
    Math.min(br.books.filter((b) => b.completed).length / br.targetBooks, 1) * 10
  );

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      toggleChecklistItem: (goalId, itemId) => {
        set((state) => {
          const goal = state.goals[goalId] as unknown as Record<string, unknown>;
          // Find array field containing the item
          for (const key of Object.keys(goal)) {
            const field = goal[key];
            if (Array.isArray(field) && field[0] && "id" in field[0]) {
              const updated = (field as ChecklistItem[]).map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              );
              const newState = {
                goals: {
                  ...state.goals,
                  [goalId]: { ...goal, [key]: updated },
                },
              };
              const progress = computeMissionProgress({ ...state, ...newState });
              return { ...newState, missionProgress: progress };
            }
          }
          return state;
        });
        get().recalculateMission();
      },

      updateGoalField: (goalId, field, value) => {
        set((state) => {
          const newState = {
            goals: {
              ...state.goals,
              [goalId]: { ...state.goals[goalId], [field]: value },
            },
          };
          const progress = computeMissionProgress({ ...state, ...newState });
          return { ...newState, missionProgress: progress };
        });
      },

      updateNestedGoalField: (goalId, path, value) => {
        set((state) => {
          const goal = { ...state.goals[goalId] } as Record<string, unknown>;
          let current = goal;
          for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]] as Record<string, unknown>;
          }
          current[path[path.length - 1]] = value;
          const newState = {
            goals: { ...state.goals, [goalId]: goal },
          };
          const progress = computeMissionProgress({ ...state, ...newState });
          return { ...newState, missionProgress: progress };
        });
      },

      toggleHabit: (date, habit) => {
        set((state) => {
          const existing = state.habits.find((h) => h.date === date);
          if (existing) {
            return {
              habits: state.habits.map((h) =>
                h.date === date ? { ...h, [habit]: !h[habit] } : h
              ),
            };
          }
          const newEntry: HabitEntry = {
            date,
            meditation: false,
            reading: false,
            workout: false,
            deepWork: false,
            water: false,
            sleep: false,
            journal: false,
            [habit]: true,
          };
          return { habits: [...state.habits, newEntry] };
        });
      },

      getHabitEntry: (date) => {
        return get().habits.find((h) => h.date === date);
      },

      saveJournalEntry: (entry) => {
        set((state) => {
          const exists = state.journal.find((j) => j.date === entry.date);
          if (exists) {
            return { journal: state.journal.map((j) => (j.date === entry.date ? entry : j)) };
          }
          return { journal: [...state.journal, entry] };
        });
      },

      getJournalEntry: (date) => {
        return get().journal.find((j) => j.date === date);
      },

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
      version: 1,
    }
  )
);
