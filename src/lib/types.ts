// Shared TypeScript types for EcoTrack Lite

export type TransportMode =
  | "car"
  | "bike"
  | "bus"
  | "metro"
  | "train"
  | "walking"
  | "cycling";

export type DietPref = "veg" | "vegan" | "nonveg";

export type VehicleType =
  | "car"
  | "bike"
  | "bus"
  | "metro"
  | "train"
  | "walking"
  | "cycling"
  | "none";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  age?: number | null;
  country?: string | null;
  city?: string | null;
  occupation?: string | null;
  diet?: string | null;
  vehicle?: string | null;
  xp: number;
  streak: number;
  lastActiveDate?: string | null;
  onboarded: boolean;
  isAdmin: boolean;
  googleAuth: boolean;
  createdAt: string;
}

export interface DailyLogInput {
  date: string;
  transportMode?: TransportMode | null;
  transportKm?: number;
  acHours?: number;
  fanHours?: number;
  lightHours?: number;
  laptopHours?: number;
  tvHours?: number;
  vegMeals?: number;
  veganMeals?: number;
  nonVegMeals?: number;
  plasticBags?: number;
  glassItems?: number;
  paperItems?: number;
  recycling?: boolean;
  composting?: boolean;
}

export interface DailyLog extends DailyLogInput {
  id: string;
  userId: string;
  transportCarbon: number;
  electricityCarbon: number;
  foodCarbon: number;
  wasteCarbon: number;
  totalCarbon: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: string;
  target: number;
  progress: number;
  completed: boolean;
  xp: number;
  createdAt: string;
}

/** Badge as returned by GET /api/badges (merged definition + earned status) */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  threshold: number;
  isDefault: boolean;
  earned: boolean;
  earnedAt: string | null;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  streak: number;
  monthlyCarbon: number;
  improvement: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface CarbonBreakdown {
  transport: number;
  electricity: number;
  food: number;
  waste: number;
  total: number;
}

export type ScoreBand = "Excellent" | "Good" | "Average" | "Needs Improvement";

export interface AIRecommendation {
  title: string;
  detail: string;
  estimatedSavingKgPerMonth: number;
}

export interface AIInsights {
  recommendations: AIRecommendation[];
  motivationalMessage: string;
}

export interface WeeklyReport {
  weeklyCarbon: number;
  topEmissionSource: string;
  biggestImprovement: string;
  nextWeekGoal: string;
  summary: string;
}

export type AppView =
  | "landing"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "log-activity"
  | "ai-insights"
  | "goals"
  | "badges"
  | "leaderboard"
  | "profile"
  | "settings"
  | "admin";
