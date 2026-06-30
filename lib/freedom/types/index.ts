// Core data types for OPERATION: FREEDOM 2026

export type GoalId =
  | "ai-engineer"
  | "ai-consultant"
  | "wealth"
  | "fitness"
  | "swimming"
  | "badminton"
  | "drone"
  | "director"
  | "december-trip"
  | "side-hustle"
  | "book-reading";

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface BookEntry {
  id: string;
  title: string;
  completed: boolean;
}

export interface AIEngineerData {
  projects: ChecklistItem[];
}

export interface AIConsultantData {
  clients: number;
  targetClients: number;
  revenue: number;
  linkedinFollowers: number;
  speakingSessions: number;
  caseStudies: number;
  websiteComplete: boolean;
}

export interface WealthData {
  salary: number;
  sideHustleRevenue: number;
  investmentGrowth: number;
  savings: number;
  targetAmount: number;
  monthlyHistory: { month: string; income: number; savings: number; investments: number }[];
}

export interface FitnessData {
  currentWeight: number;
  goalWeight: number;
  bodyFatPercent: number;
  waistCm: number;
  gymSessions: number;
  proteinDays: number;
  waterIntake: number;
  workoutStreak: number;
  weightHistory: { date: string; weight: number }[];
}

export interface SwimmingData {
  levels: ChecklistItem[];
}

export interface BadmintonData {
  sessionsLog: { date: string; sessions: number }[];
  targetSessionsPerWeek: number;
}

export interface DroneData {
  checklist: ChecklistItem[];
}

export interface DirectorData {
  teamTrainings: number;
  aiInitiatives: number;
  revenueGenerated: number;
  clientsManaged: number;
  teamSatisfaction: number;
  promotionReadiness: number;
}

export interface DecemberTripData {
  destination: string;
  budget: number;
  savedAmount: number;
  checklist: ChecklistItem[];
}

export interface SideHustleData {
  monthlyRevenue: number;
  mrr: number;
  linkedinPosts: number;
  youtubeVideos: number;
  newsletterSubscribers: number;
  emailList: number;
  websiteVisitors: number;
  checklist: ChecklistItem[];
  revenueHistory: { month: string; revenue: number }[];
}

export interface BookReadingData {
  targetBooks: number;
  dailyPageGoal: number;
  pagesReadToday: number;
  totalPagesRead: number;
  readingStreak: number;
  books: BookEntry[];
}

export interface GoalData {
  "ai-engineer": AIEngineerData;
  "ai-consultant": AIConsultantData;
  wealth: WealthData;
  fitness: FitnessData;
  swimming: SwimmingData;
  badminton: BadmintonData;
  drone: DroneData;
  director: DirectorData;
  "december-trip": DecemberTripData;
  "side-hustle": SideHustleData;
  "book-reading": BookReadingData;
}

export interface HabitEntry {
  date: string; // YYYY-MM-DD
  meditation: boolean;
  reading: boolean;
  workout: boolean;
  deepWork: boolean;
  water: boolean;
  sleep: boolean;
  journal: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  todaysWin: string;
  tomorrowsPriority: string;
  lessonsLearned: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AppState {
  goals: GoalData;
  habits: HabitEntry[];
  journal: JournalEntry[];
  achievements: Achievement[];
  missionProgress: number;
  dailyStreak: number;
  weeklyScore: number;
  monthlyScore: number;
  lastUpdated: string;
}
