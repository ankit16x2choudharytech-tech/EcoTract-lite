import type { DailyLog } from "./types";
import { getScoreBand, bandColor } from "./carbon";
import { todayStr, daysAgoStr } from "./store";

export interface DashboardStats {
  todayKg: number;
  weekKg: number;
  monthKg: number;
  todayBand: ReturnType<typeof getScoreBand>;
  todayBandColor: string;
  avgPerDay: number;
  bestDayKg: number | null;
  loggedDays: number;
  trend: { date: string; kg: number; transport: number; electricity: number; food: number; waste: number }[];
  categoryTotals: { transport: number; electricity: number; food: number; waste: number };
}

export function computeStats(logs: DailyLog[]): DashboardStats {
  const today = todayStr();
  const weekAgo = daysAgoStr(7);
  const monthAgo = daysAgoStr(30);

  const todayLog = logs.find((l) => l.date === today);
  const todayKg = todayLog?.totalCarbon ?? 0;

  const weekLogs = logs.filter((l) => l.date >= weekAgo);
  const weekKg = weekLogs.reduce((s, l) => s + l.totalCarbon, 0);

  const monthLogs = logs.filter((l) => l.date >= monthAgo);
  const monthKg = monthLogs.reduce((s, l) => s + l.totalCarbon, 0);

  const allKg = logs.map((l) => l.totalCarbon);
  const bestDayKg = allKg.length ? Math.min(...allKg) : null;
  const avgPerDay = logs.length ? logs.reduce((s, l) => s + l.totalCarbon, 0) / logs.length : 0;

  // last 14 days trend (fill missing days with 0)
  const trend: DashboardStats["trend"] = [];
  for (let i = 13; i >= 0; i--) {
    const d = daysAgoStr(i);
    const log = logs.find((l) => l.date === d);
    trend.push({
      date: d,
      kg: log?.totalCarbon ?? 0,
      transport: log?.transportCarbon ?? 0,
      electricity: log?.electricityCarbon ?? 0,
      food: log?.foodCarbon ?? 0,
      waste: log?.wasteCarbon ?? 0,
    });
  }

  const categoryTotals = logs.reduce(
    (acc, l) => {
      acc.transport += l.transportCarbon;
      acc.electricity += l.electricityCarbon;
      acc.food += l.foodCarbon;
      acc.waste += l.wasteCarbon;
      return acc;
    },
    { transport: 0, electricity: 0, food: 0, waste: 0 }
  );

  return {
    todayKg,
    weekKg: Math.round(weekKg * 100) / 100,
    monthKg: Math.round(monthKg * 100) / 100,
    todayBand: getScoreBand(todayKg),
    todayBandColor: bandColor(getScoreBand(todayKg)),
    avgPerDay: Math.round(avgPerDay * 100) / 100,
    bestDayKg: bestDayKg !== null ? Math.round(bestDayKg * 100) / 100 : null,
    loggedDays: logs.length,
    trend,
    categoryTotals,
  };
}

export function formatDateShort(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatWeekday(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short" });
}
