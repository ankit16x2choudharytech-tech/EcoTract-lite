"use client";

import { authHeaders, useEcoStore } from "./store";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  /*new code add line 10-14 */
  let token = useEcoStore.getState().token;

  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("ecotrack_token");
  }
  
  const res = await fetch(path, {
    ...options,
    headers: { ...authHeaders(token), ...(options.headers ?? {}) },
  });

  if (res.status === 401 && typeof window !== "undefined") {
    console.warn("Unauthorized request detected for path:", path);
  }
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
  return data as T;
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request<{ user: import("./types").PublicUser; token: string }>(
      "/api/auth",
      {
        method: "POST",
        body: JSON.stringify({ action: "signup", name, email, password }),
      }
    ),
  login: (email: string, password: string) =>
    request<{ user: import("./types").PublicUser; token: string }>(
      "/api/auth",
      {
        method: "POST",
        body: JSON.stringify({ action: "login", email, password }),
      }
    ),
  googleLogin: (email: string, name: string) =>
    request<{ user: import("./types").PublicUser; token: string }>(
      "/api/auth",
      {
        method: "POST",
        body: JSON.stringify({ action: "google", email, name }),
      }
    ),
  me: () => request<{ user: import("./types").PublicUser }>("/api/profile"),
  updateProfile: (body: Record<string, unknown>) =>
    request<{ user: import("./types").PublicUser }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getLogs: (days = 60) =>
    request<{ logs: import("./types").DailyLog[] }>(
      `/api/logs?days=${days}`
    ),
  saveLog: (body: import("./types").DailyLogInput) =>
    request<{
      log: import("./types").DailyLog;
      xpAwarded: number;
      streakUpdated: boolean;
      newBadges: { name: string; description: string }[];
      user: import("./types").PublicUser;
    }>("/api/logs", { method: "POST", body: JSON.stringify(body) }),
  deleteLog: (date: string) =>
    request<{ ok: boolean }>(`/api/logs/${date}`, { method: "DELETE" }),
  getGoals: () =>
    request<{
      goals: import("./types").Goal[];
      templates: typeof import("./carbon").GOAL_TEMPLATES;
    }>("/api/goals"),
  createGoal: (body: {
    title: string;
    description?: string;
    type: string;
    target: number;
    xp?: number;
  }) =>
    request<{ goal: import("./types").Goal }>("/api/goals", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  patchGoal: (id: string, action: "increment" | "complete" | "reset") =>
    request<{
      goal: import("./types").Goal;
      user: import("./types").PublicUser;
      xpAwarded: number;
    }>(`/api/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),
  deleteGoal: (id: string) =>
    request<{ ok: boolean }>(`/api/goals/${id}`, { method: "DELETE" }),
  getBadges: () =>
    request<{ badges: import("./types").Badge[] }>("/api/badges"),
  getLeaderboard: (sort = "xp") =>
    request<{ leaderboard: import("./types").LeaderboardEntry[] }>(
      `/api/leaderboard?sort=${sort}`
    ),
  aiRecommendations: () =>
    request<import("./types").AIInsights>("/api/ai/recommendations", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  aiWeeklyReport: () =>
    request<import("./types").WeeklyReport>("/api/ai/weekly-report", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  seed: () => request<{ seeded: boolean; count?: number }>("/api/seed", { method: "POST" }),

  // ---- Admin ----
  adminStats: () =>
    request<{
      totals: {
        users: number; admins: number; onboarded: number; logs: number;
        goals: number; completedGoals: number; badges: number;
        totalCo2: number; avgCo2PerLog: number;
      };
      engagement: { activeThisWeek: number; activeToday: number; newThisWeek: number };
      trend: { date: string; co2: number; logs: number }[];
      categories: { transport: number; electricity: number; food: number; waste: number };
      topEmitters: { name: string; email: string; co2: number }[];
    }>("/api/admin/stats"),
  adminUsers: (q?: string, role?: "all" | "admin" | "user") =>
    request<{
      users: (import("./types").PublicUser & {
        _count: { dailyLogs: number; goals: number; badges: number };
        monthlyCo2: number;
      })[];
    }>(`/api/admin/users?q=${encodeURIComponent(q ?? "")}&role=${role ?? "all"}`),
  adminUser: (id: string) =>
    request<{
      user: import("./types").PublicUser;
      logs: import("./types").DailyLog[];
      goals: import("./types").Goal[];
      badges: import("./types").Badge[];
    }>(`/api/admin/users/${id}`),
  adminPatchUser: (id: string, action: string, value?: number | boolean) =>
    request<{ user: import("./types").PublicUser }>(
      `/api/admin/users/${id}`,
      { method: "PATCH", body: JSON.stringify({ action, value }) }
    ),
  adminDeleteUser: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" }),
  adminLogs: (days = 30, userId?: string) =>
    request<{
      logs: {
        id: string; date: string; userName: string; userEmail: string; userId: string;
        transportMode: string | null; transportKm: number;
        transportCarbon: number; electricityCarbon: number; foodCarbon: number;
        wasteCarbon: number; totalCarbon: number; createdAt: string;
      }[];
      count: number;
    }>(`/api/admin/logs?days=${days}${userId ? `&userId=${userId}` : ""}`),
  adminDeleteLog: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/logs/${id}`, { method: "DELETE" }),
  adminGoals: () =>
    request<{
      goals: {
        id: string; title: string; type: string; target: number; progress: number;
        completed: boolean; xp: number; userName: string; userEmail: string; createdAt: string;
      }[];
      stats: {
        total: number; completed: number;
        byType: { type: string; count: number; completed: number }[];
      };
    }>("/api/admin/goals"),
  adminBadges: () =>
    request<{
      badges: {
        id: string; name: string; description: string | null;
        userName: string; userEmail: string; earnedAt: string;
      }[];
      stats: { total: number; byName: { name: string; count: number }[] };
    }>("/api/admin/badges"),
  adminBadgeDefs: () =>
    request<{
      badgeDefs: {
        id: string; name: string; description: string | null; icon: string;
        criteria: string; threshold: number; isDefault: boolean; awardedCount: number;
      }[];
    }>("/api/admin/badge-defs"),
  adminCreateBadgeDef: (body: {
    name: string; description?: string; icon?: string;
    criteria?: string; threshold?: number;
  }) =>
    request<{ badgeDef: { id: string; name: string; description: string | null; icon: string; criteria: string; threshold: number; isDefault: boolean } }>(
      "/api/admin/badge-defs",
      { method: "POST", body: JSON.stringify(body) }
    ),
  adminDeleteBadgeDef: (id: string) =>
    request<{ ok: boolean }>(`/api/admin/badge-defs/${id}`, { method: "DELETE" }),
  adminGrantBadge: (userId: string, badgeDefId: string) =>
    request<{ ok: boolean; alreadyEarned?: boolean }>(
      `/api/admin/users/${userId}/grant-badge`,
      { method: "POST", body: JSON.stringify({ badgeDefId }) }
    ),
};
