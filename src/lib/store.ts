"use client";

import { create } from "zustand";
import type {
  AppView,
  Badge,
  DailyLog,
  Goal,
  LeaderboardEntry,
  PublicUser,
} from "./types";

// Re-export shared date helpers (defined in carbon.ts so server routes can use them too)
export { todayStr, daysAgoStr } from "./carbon";

interface EcoState {
  // session
  user: PublicUser | null;
  token: string | null;
  hydrated: boolean;

  // navigation
  view: AppView;
  setView: (v: AppView) => void;

  // data cache
  logs: DailyLog[];
  goals: Goal[];
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;

  // actions
  hydrate: () => void;
  setSession: (user: PublicUser, token: string) => void;
  logout: () => void;
  setUser: (u: PublicUser) => void;
  setLogs: (l: DailyLog[]) => void;
  setGoals: (g: Goal[]) => void;
  setBadges: (b: Badge[]) => void;
  setLeaderboard: (l: LeaderboardEntry[]) => void;
  setLoading: (b: boolean) => void;
}

const USER_KEY = "ecotrack_user";
const TOKEN_KEY = "ecotrack_token";

export const useEcoStore = create<EcoState>((set) => ({
  user: null,
  token: null,
  hydrated: false,

  view: "landing",
  setView: (v) => set({ view: v }),

  logs: [],
  goals: [],
  badges: [],
  leaderboard: [],
  loading: false,

  hydrate: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      const t = localStorage.getItem(TOKEN_KEY);
      if (u && t) {
        const parsed = JSON.parse(u) as PublicUser;
        set({
          user: parsed,
          token: t,
          view: parsed.onboarded ? "dashboard" : "onboarding",
          hydrated: true,
        });
        return;
      }
    } catch {
      /* ignore */
    }
    set({ hydrated: true, view: "landing" });
  },

  setSession: (user, token) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    set({
      user,
      token,
      view: user.onboarded ? "dashboard" : "onboarding",
    });
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    set({
      user: null,
      token: null,
      view: "landing",
      logs: [],
      goals: [],
      badges: [],
      leaderboard: [],
    });
  },

  setUser: (u) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    set({ user: u });
  },

  setLogs: (l) => set({ logs: l }),
  setGoals: (g) => set({ goals: g }),
  setBadges: (b) => set({ badges: b }),
  setLeaderboard: (l) => set({ leaderboard: l }),
  setLoading: (b) => set({ loading: b }),
}));

/** Helper to build auth headers for API calls */
export function authHeaders(token: string | null): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
