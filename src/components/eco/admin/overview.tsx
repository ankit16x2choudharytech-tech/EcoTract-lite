"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  FileText,
  Target,
  Award,
  TrendingDown,
  Activity,
  UserPlus,
  Flame,
  Leaf,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { AdminLoading } from "../admin-panel";
import { formatDateShort } from "@/lib/stats";

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#14b8a6"];

type Stats = Awaited<ReturnType<typeof api.adminStats>>;

export function AdminOverview() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await api.adminStats();
        if (mounted) setData(d);
      } catch (e) {
        if (mounted) setError((e as Error).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (error)
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-sm text-red-600">
          Failed to load stats: {error}
        </CardContent>
      </Card>
    );
  if (!data) return <AdminLoading />;

  const cards = [
    { icon: Users, label: "Total Users", value: data.totals.users, sub: `${data.totals.onboarded} onboarded`, tint: "bg-blue-100 text-blue-700" },
    { icon: FileText, label: "Activity Logs", value: data.totals.logs, sub: `${data.totals.avgCo2PerLog} kg/log avg`, tint: "bg-emerald-100 text-emerald-700" },
    { icon: TrendingDown, label: "Total CO₂ Tracked", value: `${data.totals.totalCo2}`, unit: "kg", sub: "all-time", tint: "bg-teal-100 text-teal-700" },
    { icon: Target, label: "Goals", value: data.totals.goals, sub: `${data.totals.completedGoals} completed`, tint: "bg-amber-100 text-amber-700" },
    { icon: Award, label: "Badges Awarded", value: data.totals.badges, sub: `${data.totals.users} users`, tint: "bg-purple-100 text-purple-700" },
    { icon: Activity, label: "Active This Week", value: data.engagement.activeThisWeek, sub: `${data.engagement.activeToday} today`, tint: "bg-orange-100 text-orange-700" },
    { icon: UserPlus, label: "New This Week", value: data.engagement.newThisWeek, sub: "signups", tint: "bg-pink-100 text-pink-700" },
    { icon: Flame, label: "Admins", value: data.totals.admins, sub: "privileged", tint: "bg-slate-200 text-slate-700" },
  ];

  const pieData = [
    { name: "Transport", value: data.categories.transport },
    { name: "Electricity", value: data.categories.electricity },
    { name: "Food", value: data.categories.food },
    { name: "Waste", value: data.categories.waste },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-slate-200 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {c.label}
                </span>
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${c.tint}`}>
                  <c.icon size={16} />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold sm:text-3xl">{c.value}</span>
                {c.unit && <span className="text-xs text-muted-foreground">{c.unit}</span>}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{c.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="text-emerald-600" size={18} />
              Platform CO₂ Trend (14 days)
            </CardTitle>
            <CardDescription>Daily total emissions across all users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#64748b" }} interval={1} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={42} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    labelFormatter={(l) => formatDateShort(String(l))}
                    formatter={(v: number, n: string) => (n === "co2" ? [`${v} kg`, "CO₂"] : [v, "Logs"])}
                  />
                  <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2.5} fill="url(#adminCo2)" dot={{ r: 3, fill: "#10b981" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Leaf className="text-emerald-600" size={18} />
              Emission Sources
            </CardTitle>
            <CardDescription>All-time platform totals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: number) => [`${v} kg`, "CO₂"]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="text-emerald-600" size={18} />
              Daily Logging Activity
            </CardTitle>
            <CardDescription>Number of logs per day (14 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#64748b" }} interval={1} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={32} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} labelFormatter={(l) => formatDateShort(String(l))} />
                  <Bar dataKey="logs" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="text-orange-500" size={18} />
              Top Emitters (30d)
            </CardTitle>
            <CardDescription>By total monthly CO₂</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topEmitters.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No logs in the last 30 days.
              </p>
            ) : (
              <div className="space-y-3">
                {data.topEmitters.map((e, i) => (
                  <div key={e.email} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{e.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{e.email}</div>
                    </div>
                    <UiBadge className="bg-orange-100 text-orange-700">{e.co2} kg</UiBadge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
