// Carbon calculation engine for EcoTrack Lite
// All emission factors are documented & based on public datasets (no paid APIs).

import type { CarbonBreakdown, DailyLogInput, ScoreBand } from "./types";

/** kg CO2 per km for each transport mode */
export const TRANSPORT_FACTORS: Record<string, number> = {
  car: 0.192,
  bike: 0.103,
  bus: 0.089,
  metro: 0.041,
  train: 0.041,
  walking: 0,
  cycling: 0,
};

/**
 * Electricity factors (kg CO2 per hour of use).
 * Based on average device wattage × India grid emission factor (~0.71 kg CO2/kWh).
 */
export const ELECTRICITY_FACTORS = {
  ac: 1.5 * 0.71, // 1.5 kW AC
  fan: 0.075 * 0.71, // 75W fan
  light: 0.01 * 0.71, // 10W LED
  laptop: 0.05 * 0.71, // 50W laptop
  tv: 0.1 * 0.71, // 100W TV
} as const;

/** kg CO2 per meal by diet type */
export const FOOD_FACTORS = {
  veg: 1.0,
  vegan: 0.6,
  nonveg: 3.0,
} as const;

/** Waste factors (kg CO2 per item / per action) */
export const WASTE_FACTORS = {
  plasticBag: 0.1,
  glass: 0.05,
  paper: 0.03,
  recyclingCredit: -0.5,
  compostingCredit: -0.3,
} as const;

export function calculateTransport(mode: string | null | undefined, km: number): number {
  if (!mode) return 0;
  const factor = TRANSPORT_FACTORS[mode] ?? 0;
  return round2(km * factor);
}

export function calculateElectricity(input: DailyLogInput): number {
  const ac = (input.acHours ?? 0) * ELECTRICITY_FACTORS.ac;
  const fan = (input.fanHours ?? 0) * ELECTRICITY_FACTORS.fan;
  const light = (input.lightHours ?? 0) * ELECTRICITY_FACTORS.light;
  const laptop = (input.laptopHours ?? 0) * ELECTRICITY_FACTORS.laptop;
  const tv = (input.tvHours ?? 0) * ELECTRICITY_FACTORS.tv;
  return round2(ac + fan + light + laptop + tv);
}

export function calculateFood(input: DailyLogInput): number {
  const veg = (input.vegMeals ?? 0) * FOOD_FACTORS.veg;
  const vegan = (input.veganMeals ?? 0) * FOOD_FACTORS.vegan;
  const nonVeg = (input.nonVegMeals ?? 0) * FOOD_FACTORS.nonveg;
  return round2(veg + vegan + nonVeg);
}

export function calculateWaste(input: DailyLogInput): number {
  const plastic = (input.plasticBags ?? 0) * WASTE_FACTORS.plasticBag;
  const glass = (input.glassItems ?? 0) * WASTE_FACTORS.glass;
  const paper = (input.paperItems ?? 0) * WASTE_FACTORS.paper;
  const recycling = input.recycling ? WASTE_FACTORS.recyclingCredit : 0;
  const composting = input.composting ? WASTE_FACTORS.compostingCredit : 0;
  return round2(plastic + glass + paper + recycling + composting);
}

export function calculateBreakdown(input: DailyLogInput): CarbonBreakdown {
  const transport = calculateTransport(input.transportMode, input.transportKm ?? 0);
  const electricity = calculateElectricity(input);
  const food = calculateFood(input);
  const waste = calculateWaste(input);
  const total = round2(transport + electricity + food + waste);
  return { transport, electricity, food, waste, total };
}

/** Carbon score band based on daily total kg CO2 */
export function getScoreBand(dailyKg: number): ScoreBand {
  if (dailyKg <= 20) return "Excellent";
  if (dailyKg <= 40) return "Good";
  if (dailyKg <= 60) return "Average";
  return "Needs Improvement";
}

export function bandColor(band: ScoreBand): string {
  switch (band) {
    case "Excellent":
      return "text-emerald-600";
    case "Good":
      return "text-lime-600";
    case "Average":
      return "text-amber-600";
    case "Needs Improvement":
      return "text-red-600";
  }
}

/** Average daily kg CO2 of an Indian citizen (for comparison) */
export const INDIA_AVG_DAILY_KG = 1.8;
/** Average daily kg CO2 of a global citizen */
export const GLOBAL_AVG_DAILY_KG = 16;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---- Date helpers (shared, framework-agnostic) ----

/** Returns YYYY-MM-DD for a given date (local time). */
export function todayStr(d = new Date()): string {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

/** Returns YYYY-MM-DD for n days ago. */
export function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayStr(d);
}

// ---- Gamification ----

export const XP_RULES = {
  dailyLogin: 10,
  activityAdded: 20,
  activityUpdated: 5,
  goalCompleted: 50,
  weeklyStreak: 100,
  streak7: 50,
  streak30: 200,
} as const;

export interface BadgeDef {
  name: string;
  description: string;
  icon: string; // lucide icon name
}

export const BADGE_DEFS: BadgeDef[] = [
  { name: "Green Starter", description: "Logged your first activity", icon: "Sprout" },
  { name: "Eco Explorer", description: "Logged 5 daily activities", icon: "Compass" },
  { name: "Carbon Fighter", description: "Logged 25 daily activities", icon: "Sword" },
  { name: "Planet Protector", description: "Reached a 30-day streak", icon: "Shield" },
  { name: "Earth Hero", description: "Kept a day under 5 kg CO₂", icon: "Award" },
];

/** Returns badge names that should be earned given user stats */
export function evaluateBadges(args: {
  totalLoggedDays: number;
  streak: number;
  bestDayKg: number | null;
  hasAnyLog: boolean;
}): string[] {
  const { totalLoggedDays, streak, bestDayKg, hasAnyLog } = args;
  const earned: string[] = [];
  if (hasAnyLog) earned.push("Green Starter");
  if (totalLoggedDays >= 5) earned.push("Eco Explorer");
  if (totalLoggedDays >= 25) earned.push("Carbon Fighter");
  if (streak >= 30) earned.push("Planet Protector");
  if (bestDayKg !== null && bestDayKg <= 5) earned.push("Earth Hero");
  return earned;
}

/** Suggested goal templates */
export const GOAL_TEMPLATES = [
  {
    type: "bicycle",
    title: "Use bicycle 3 days a week",
    description: "Swap motorized transport for cycling on 3 days.",
    target: 3,
    xp: 50,
  },
  {
    type: "walk",
    title: "Walk 5000 steps daily",
    description: "Walk instead of taking short rides for a week.",
    target: 7,
    xp: 50,
  },
  {
    type: "noplastic",
    title: "No plastic bags for 7 days",
    description: "Carry a reusable bag everywhere for a week.",
    target: 7,
    xp: 50,
  },
  {
    type: "lights",
    title: "Switch off unused lights for 7 days",
    description: "Be mindful of electricity use this week.",
    target: 7,
    xp: 50,
  },
  {
    type: "vegday",
    title: "Eat plant-based meals 3 days",
    description: "Try vegetarian/vegan meals to cut food emissions.",
    target: 3,
    xp: 50,
  },
];
