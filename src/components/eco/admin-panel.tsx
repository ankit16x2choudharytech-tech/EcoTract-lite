"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  Target,
  Award,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEcoStore } from "@/lib/store";
import { AdminOverview } from "./admin/overview";
import { AdminUsers } from "./admin/users";
import { AdminLogs } from "./admin/logs";
import { AdminGoals } from "./admin/goals";
import { AdminBadges } from "./admin/badges";

type AdminTab = "overview" | "users" | "logs" | "goals" | "badges";

const TABS: { key: AdminTab; label: string; icon: typeof Users }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "logs", label: "Activity Logs", icon: FileText },
  { key: "goals", label: "Goals", icon: Target },
  { key: "badges", label: "Badges", icon: Award },
];

export function AdminPanel() {
  const setView = useEcoStore((s) => s.setView);
  const [tab, setTab] = useState<AdminTab>("overview");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Admin top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-sm">
              <Shield size={18} />
            </span>
            <div className="leading-none">
              <div className="text-base font-extrabold tracking-tight">
                Admin <span className="text-slate-500">Panel</span>
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                EcoTrack Lite · Control center
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("dashboard")}
          >
            <ArrowLeft size={16} className="mr-1" /> Back to app
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Tab bar */}
        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  active
                    ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "overview" && <AdminOverview />}
          {tab === "users" && <AdminUsers />}
          {tab === "logs" && <AdminLogs />}
          {tab === "goals" && <AdminGoals />}
          {tab === "badges" && <AdminBadges />}
        </motion.div>
      </div>
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2 className="animate-spin text-slate-500" size={28} />
      <p className="text-sm text-muted-foreground">Loading admin data…</p>
    </div>
  );
}
