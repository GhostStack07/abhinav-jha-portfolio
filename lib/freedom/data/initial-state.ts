import type { AppState } from "@/lib/freedom/types";

export const INITIAL_STATE: AppState = {
  missionProgress: 0,
  dailyStreak: 0,
  weeklyScore: 0,
  monthlyScore: 0,
  lastUpdated: new Date().toISOString(),

  goals: {
    "ai-engineer": {
      projects: [
        { id: "chatbot", label: "AI Chatbot", completed: false },
        { id: "lead-agent", label: "Lead Qualification Agent", completed: false },
        { id: "hotel-crm", label: "Hotel CRM Automation", completed: false },
        { id: "whatsapp", label: "WhatsApp AI Agent", completed: false },
        { id: "voice-ai", label: "Voice AI", completed: false },
        { id: "proposal-gen", label: "Proposal Generator", completed: false },
        { id: "ai-reporting", label: "AI Reporting Dashboard", completed: false },
        { id: "hotel-booking", label: "Hotel Booking AI", completed: false },
        { id: "content-auto", label: "Content Automation", completed: false },
        { id: "multi-agent", label: "Multi-Agent Workflow", completed: false },
      ],
    },

    "ai-consultant": {
      clients: 0,
      targetClients: 5,
      revenue: 0,
      linkedinFollowers: 0,
      speakingSessions: 0,
      caseStudies: 0,
      websiteComplete: false,
    },

    wealth: {
      salary: 0,
      sideHustleRevenue: 0,
      investmentGrowth: 0,
      savings: 0,
      targetAmount: 3000000,
      monthlyHistory: [
        { month: "Jan", income: 0, savings: 0, investments: 0 },
        { month: "Feb", income: 0, savings: 0, investments: 0 },
        { month: "Mar", income: 0, savings: 0, investments: 0 },
        { month: "Apr", income: 0, savings: 0, investments: 0 },
        { month: "May", income: 0, savings: 0, investments: 0 },
        { month: "Jun", income: 0, savings: 0, investments: 0 },
      ],
    },

    fitness: {
      currentWeight: 80,
      goalWeight: 70,
      bodyFatPercent: 20,
      waistCm: 88,
      gymSessions: 0,
      proteinDays: 0,
      waterIntake: 2,
      workoutStreak: 0,
      weightHistory: [
        { date: "Jan", weight: 80 },
        { date: "Feb", weight: 80 },
        { date: "Mar", weight: 80 },
      ],
    },

    swimming: {
      levels: [
        { id: "floating", label: "Floating", completed: false },
        { id: "breathing", label: "Breathing Technique", completed: false },
        { id: "freestyle", label: "Freestyle", completed: false },
        { id: "100m", label: "100m Swim", completed: false },
        { id: "500m", label: "500m Swim", completed: false },
        { id: "1000m", label: "1000m Swim", completed: false },
      ],
    },

    badminton: {
      targetSessionsPerWeek: 2,
      sessionsLog: [],
    },

    drone: {
      checklist: [
        { id: "dgca-rules", label: "Study DGCA Rules", completed: false },
        { id: "training", label: "Complete Training", completed: false },
        { id: "simulator", label: "Simulator Practice", completed: false },
        { id: "flight-hours", label: "Log 10 Flight Hours", completed: false },
        { id: "exam", label: "Pass Written Exam", completed: false },
        { id: "license", label: "Obtain License", completed: false },
        { id: "commercial", label: "First Commercial Shoot", completed: false },
      ],
    },

    director: {
      teamTrainings: 0,
      aiInitiatives: 0,
      revenueGenerated: 0,
      clientsManaged: 0,
      teamSatisfaction: 0,
      promotionReadiness: 0,
    },

    "december-trip": {
      destination: "International Destination",
      budget: 200000,
      savedAmount: 0,
      checklist: [
        { id: "passport", label: "Passport Valid", completed: false },
        { id: "visa", label: "Visa Applied", completed: false },
        { id: "flights", label: "Flights Booked", completed: false },
        { id: "hotels", label: "Hotels Booked", completed: false },
        { id: "insurance", label: "Travel Insurance", completed: false },
        { id: "packing", label: "Packing Complete", completed: false },
      ],
    },

    "side-hustle": {
      monthlyRevenue: 0,
      mrr: 0,
      linkedinPosts: 0,
      youtubeVideos: 0,
      newsletterSubscribers: 0,
      emailList: 0,
      websiteVisitors: 0,
      checklist: [
        { id: "website", label: "Website Live", completed: false },
        { id: "brand", label: "Brand Identity Created", completed: false },
        { id: "offer", label: "Offer Defined", completed: false },
        { id: "first-client", label: "First Client", completed: false },
      ],
      revenueHistory: [],
    },
  },

  habits: [],
  journal: [],

  achievements: [
    { id: "first-client", title: "First Client", description: "Land your first paying client", icon: "👤", unlocked: false },
    { id: "10-workouts", title: "Iron Will", description: "Complete 10 workouts", icon: "💪", unlocked: false },
    { id: "100-linkedin", title: "Networker", description: "Reach 100 LinkedIn followers", icon: "🔗", unlocked: false },
    { id: "first-ai-project", title: "AI Builder", description: "Complete first AI project", icon: "🤖", unlocked: false },
    { id: "1l-earned", title: "Lakhpati", description: "Earn ₹1 Lakh", icon: "💰", unlocked: false },
    { id: "swimming-500m", title: "Swimmer", description: "Swim 500 meters", icon: "🏊", unlocked: false },
    { id: "drone-certified", title: "Drone Pilot", description: "Obtain drone license", icon: "🚁", unlocked: false },
    { id: "director", title: "Leader", description: "Reach Director readiness 80%+", icon: "🎯", unlocked: false },
    { id: "side-hustle-launched", title: "Entrepreneur", description: "Launch your side hustle", icon: "🚀", unlocked: false },
  ],
};
