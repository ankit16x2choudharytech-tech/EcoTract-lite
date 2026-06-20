"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Target,
  Award,
  Trophy,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  Flame,
  Zap,
  Menu,
  X,
  Leaf,
  Shield,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Brand } from "./brand";
import { Footer } from "./footer";
import { useEcoStore } from "@/lib/store";
import type { AppView } from "@/lib/types";
import { toast } from "sonner";

const NAV: { view: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "log-activity", label: "Log Activity", icon: PlusCircle },
  { view: "ai-insights", label: "AI Insights", icon: Sparkles },
  { view: "goals", label: "Goals", icon: Target },
  { view: "badges", label: "Badges", icon: Award },
  { view: "leaderboard", label: "Leaderboard", icon: Trophy },
  { view: "profile", label: "Profile", icon: UserIcon },
  { view: "settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const view = useEcoStore((s) => s.view);
  const setView = useEcoStore((s) => s.setView);
  const user = useEcoStore((s) => s.user);
  const logout = useEcoStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  function go(v: AppView) {
    setView(v);
    setMobileOpen(false);
  }

  function handleLogout() {
    logout();
    toast.success("Logged out. See you soon! 🌱");
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <Brand />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1.5 text-sm sm:flex">
              <Flame size={15} className="text-orange-500" />
              <span className="font-semibold">{user?.streak ?? 0}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1.5 text-sm sm:flex">
              <Zap size={15} className="text-amber-500" />
              <span className="font-semibold">{user?.xp ?? 0}</span>
              <span className="text-muted-foreground">XP</span>
            </div>
            {user?.isAdmin && (
              <button
                onClick={() => go("admin")}
                title="Admin Panel"
                className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 sm:flex"
              >
                <Crown size={15} /> Admin
              </button>
            )}
            <Avatar
              className="h-9 w-9 cursor-pointer border-2 border-emerald-200"
              onClick={() => go("profile")}
            >
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-700 text-xs font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-emerald-100 bg-background p-4 lg:flex">
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => go(item.view)}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          {user?.isAdmin && (
            <div className="mt-2 space-y-1 border-t border-slate-200 pt-3">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Administration
              </div>
              <button
                onClick={() => go("admin")}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  view === "admin"
                    ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Shield size={18} />
                Admin Panel
              </button>
            </div>
          )}
          <div className="mt-4 space-y-2 border-t border-emerald-100 pt-4">
            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <Leaf size={13} /> Eco Tip
              </div>
              <p className="mt-1 text-muted-foreground">
                Walking 2km instead of driving saves ~0.4 kg CO₂ per trip.
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" /> Log out
            </Button>
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-background p-4 shadow-xl lg:hidden"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Brand onClick={() => setMobileOpen(false)} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X size={20} />
                  </Button>
                </div>
                <nav className="flex flex-1 flex-col gap-1">
                  {NAV.map((item) => {
                    const active = view === item.view;
                    return (
                      <button
                        key={item.view}
                        onClick={() => go(item.view)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-emerald-600 text-white"
                            : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
                {user?.isAdmin && (
                  <button
                    onClick={() => go("admin")}
                    className={`mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium transition-colors ${
                      view === "admin"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Shield size={18} /> Admin Panel
                  </button>
                )}
                <div className="mt-4 flex items-center gap-2 border-t border-emerald-100 pt-4">
                  <UiBadge className="bg-orange-100 text-orange-700">
                    <Flame size={12} className="mr-1" /> {user?.streak ?? 0}d
                  </UiBadge>
                  <UiBadge className="bg-amber-100 text-amber-700">
                    <Zap size={12} className="mr-1" /> {user?.xp ?? 0} XP
                  </UiBadge>
                </div>
                <Button
                  variant="ghost"
                  className="mt-2 w-full justify-start text-muted-foreground hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" /> Log out
                </Button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
