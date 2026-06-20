"use client";

import { useEffect } from "react";
import { useEcoStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Landing } from "@/components/eco/landing";
import { AuthView } from "@/components/eco/auth-view";
import { OnboardingView } from "@/components/eco/onboarding";
import { AppShell } from "@/components/eco/app-shell";
import { DashboardView } from "@/components/eco/dashboard";
import { LogActivityView } from "@/components/eco/log-activity";
import { AiInsightsView } from "@/components/eco/ai-insights";
import { GoalsView } from "@/components/eco/goals";
import { BadgesView } from "@/components/eco/badges";
import { LeaderboardView } from "@/components/eco/leaderboard";
import { ProfileView } from "@/components/eco/profile";
import { SettingsView } from "@/components/eco/settings";
import { AdminPanel } from "@/components/eco/admin-panel";

export default function Home() {
  const {
    hydrated,
    hydrate,
    user,
    token,
    view,
    setLogs,
    setBadges,
    setLeaderboard,
  } = useEcoStore();

  // hydrate from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // when authenticated, load core data (logs + badges) + touch daily login
  useEffect(() => {
    if (!hydrated || !user || !token) return;
    let mounted = true;
    (async () => {
      try {
        // api.me() calls GET /api/profile which runs touchDailyLogin —
        // this updates the streak, lastActiveDate & awards daily-login XP.
        const [meRes, logsRes, badgesRes] = await Promise.all([
          api.me(),
          api.getLogs(60),
          api.getBadges(),
        ]);
        if (!mounted) return;
        // refresh user so the top bar shows the updated streak/XP
        if (meRes.user) useEcoStore.getState().setUser(meRes.user);
        setLogs(logsRes.logs);
        setBadges(badgesRes.badges);
      } catch {
        /* token may be stale — ignore; user can re-login */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hydrated, user, token, setLogs, setBadges, setLeaderboard]);

  // loading gate before hydration
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="grid h-12 w-12 animate-pulse place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6" />
            </svg>
          </span>
          <p className="text-sm text-muted-foreground">Loading EcoTrack Lite…</p>
        </div>
      </div>
    );
  }

  // Not authenticated → landing or auth
  if (!user) {
    if (view === "auth") return <AuthView />;
    return <Landing />;
  }

  // Authenticated but not onboarded → onboarding
  if (!user.onboarded) {
    return <OnboardingView />;
  }

  // Authenticated + onboarded → admin panel (own full-screen layout) or app shell
  if (view === "admin") {
    if (!user.isAdmin) {
      // non-admin tried to access admin — bounce back to dashboard
      return <AppShell><DashboardView /></AppShell>;
    }
    return <AdminPanel />;
  }

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return <DashboardView />;
      case "log-activity":
        return <LogActivityView />;
      case "ai-insights":
        return <AiInsightsView />;
      case "goals":
        return <GoalsView />;
      case "badges":
        return <BadgesView />;
      case "leaderboard":
        return <LeaderboardView />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return <AppShell>{renderView()}</AppShell>;
}
