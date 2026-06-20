"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  PlusCircle,
  Sparkles,
  Flame,
  Zap,
  Award,
  TrendingDown,
  CalendarDays,
  Gauge,
  ArrowRight,
  Leaf,
  Bike,
  Lightbulb,
  Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEcoStore, todayStr } from "@/lib/store";
import { computeStats, formatDateShort } from "@/lib/stats";
import { INDIA_AVG_DAILY_KG } from "@/lib/carbon";
import { PageHeader } from "./app-shell";

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#14b8a6"];

export function DashboardView() {
  const { user, logs, badges, setView } = useEcoStore();
  const stats = useMemo(() => computeStats(logs), [logs]);

  const todayLog = logs.find((l) => l.date === todayStr());

  const pieData = [
    { name: "Transport", value: Math.round(stats.categoryTotals.transport * 100) / 100, icon: Bike },
    { name: "Electricity", value: Math.round(stats.categoryTotals.electricity * 100) / 100, icon: Lightbulb },
    { name: "Food", value: Math.round(stats.categoryTotals.food * 100) / 100, icon: Leaf },
    { name: "Waste", value: Math.round(stats.categoryTotals.waste * 100) / 100, icon: Recycle },
  ].filter((d) => d.value > 0);

  const earnedBadges = badges.filter((b) => b.earned).length;

  // weekly comparison (this week vs last week from trend)
  const last7 = stats.trend.slice(-7).reduce((s, d) => s + d.kg, 0);
  const prev7 = stats.trend.slice(0, 7).reduce((s, d) => s + d.kg, 0);
  const weekDelta =
    prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Eco Warrior"} 👋`}
        description="Here's your carbon footprint snapshot for today."
        action={
          <Button
            onClick={() => setView("log-activity")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <PlusCircle size={16} className="mr-2" />
            {todayLog ? "Update today" : "Log today's activity"}
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Gauge}
          label="Today's Emission"
          value={`${stats.todayKg.toFixed(1)}`}
          unit="kg CO₂"
          tint="emerald"
          sub={
            <span className={stats.todayBandColor}>{stats.todayBand}</span>
          }
        />
        <StatCard
          icon={CalendarDays}
          label="This Week"
          value={stats.weekKg.toFixed(1)}
          unit="kg CO₂"
          tint="teal"
          sub={
            weekDelta === 0 ? (
              <span className="text-muted-foreground">No change</span>
            ) : weekDelta < 0 ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <TrendingDown size={12} /> {Math.abs(weekDelta)}% lower
              </span>
            ) : (
              <span className="text-amber-600">+{weekDelta}% vs last week</span>
            )
          }
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${user?.streak ?? 0}`}
          unit="days"
          tint="orange"
          sub={
            <span className="text-muted-foreground">
              {user?.streak ? "Keep it going!" : "Log today to start"}
            </span>
          }
        />
        <StatCard
          icon={Zap}
          label="Carbon Score"
          value={`${user?.xp ?? 0}`}
          unit="XP"
          tint="amber"
          sub={
            <span className="text-muted-foreground">
              {earnedBadges} badges earned
            </span>
          }
        />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Trend line chart */}
        <Card className="lg:col-span-2 border-emerald-100">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="text-emerald-600" size={18} />
                14-Day Emission Trend
              </CardTitle>
              <CardDescription>
                Your daily CO₂ output over the last two weeks
              </CardDescription>
            </div>
            <UiBadge variant="secondary" className="bg-emerald-100 text-emerald-700">
              Avg {stats.avgPerDay.toFixed(1)} kg/day
            </UiBadge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateShort}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    width={38}
                    unit=""
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #d1fae5",
                      fontSize: 12,
                    }}
                    labelFormatter={(l) => formatDateShort(String(l))}
                    formatter={(v: number) => [`${v} kg`, "CO₂"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="kg"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#carbonGrad)"
                    dot={{ r: 3, fill: "#10b981" }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category pie */}
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="text-emerald-600" size={18} />
              Emission Sources
            </CardTitle>
            <CardDescription>Where your CO₂ comes from</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <Recycle size={32} className="text-muted-foreground/40" />
                Log activities to see your breakdown
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #d1fae5",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v} kg`, "CO₂"]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions + badges row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Quick log card */}
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="text-lg">Today at a glance</CardTitle>
            <CardDescription>
              {todayLog
                ? "You've logged today. Edit anytime."
                : "No activity logged yet today."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MiniStat
                icon={Bike}
                label="Transport"
                value={`${todayLog?.transportCarbon?.toFixed(1) ?? "0"} kg`}
              />
              <MiniStat
                icon={Lightbulb}
                label="Electricity"
                value={`${todayLog?.electricityCarbon?.toFixed(1) ?? "0"} kg`}
              />
              <MiniStat
                icon={Leaf}
                label="Food"
                value={`${todayLog?.foodCarbon?.toFixed(1) ?? "0"} kg`}
              />
              <MiniStat
                icon={Recycle}
                label="Waste"
                value={`${todayLog?.wasteCarbon?.toFixed(1) ?? "0"} kg`}
              />
            </div>
            <Button
              variant="outline"
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setView("log-activity")}
            >
              <PlusCircle size={16} className="mr-2" />
              {todayLog ? "Update today's log" : "Log today's activity"}
            </Button>
          </CardContent>
        </Card>

        {/* AI insights preview */}
        <Card className="relative overflow-hidden border-emerald-100">
          <div className="eco-grid-bg absolute inset-0 opacity-50" aria-hidden />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="text-emerald-600" size={18} />
              AI Insights
            </CardTitle>
            <CardDescription>Personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-muted-foreground">
              Get 5 AI-generated tips with estimated monthly CO₂ savings, plus
              your weekly progress report.
            </p>
            <Button
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setView("ai-insights")}
            >
              <Sparkles size={16} className="mr-2" /> View AI insights
            </Button>
          </CardContent>
        </Card>

        {/* Badges / progress */}
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="text-emerald-600" size={18} />
              Achievements
            </CardTitle>
            <CardDescription>{earnedBadges} of {badges.length} badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress
              value={badges.length ? (earnedBadges / badges.length) * 100 : 0}
              className="h-2"
            />
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 5).map((b) => (
                <span
                  key={b.name}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    b.earned
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                  title={b.description}
                >
                  {b.earned ? "🏆" : "🔒"} {b.name}
                </span>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setView("badges")}
            >
              View all badges <ArrowRight size={14} className="ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Comparison strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-green-50/40">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white">
                <Leaf size={22} />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  Your average vs national average
                </div>
                <div className="text-xs text-muted-foreground">
                  India avg: ~{INDIA_AVG_DAILY_KG} kg/day per person
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.avgPerDay.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">You (kg/day)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {INDIA_AVG_DAILY_KG}
                </div>
                <div className="text-xs text-muted-foreground">India avg</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    stats.avgPerDay <= INDIA_AVG_DAILY_KG
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {stats.avgPerDay <= INDIA_AVG_DAILY_KG ? "↓" : "↑"}
                  {Math.abs(
                    Math.round(
                      ((stats.avgPerDay - INDIA_AVG_DAILY_KG) /
                        INDIA_AVG_DAILY_KG) *
                        100
                    )
                  )}
                  %
                </div>
                <div className="text-xs text-muted-foreground">vs avg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  tint,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  unit: string;
  sub?: React.ReactNode;
  tint: "emerald" | "teal" | "orange" | "amber";
}) {
  const tints: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  };
  return (
    <Card className="border-emerald-100">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </span>
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${tints[tint]}`}>
            <Icon size={16} />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-bold sm:text-3xl">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        {sub && <div className="mt-1 text-xs">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bike;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 p-2.5">
      <Icon size={16} className="text-emerald-600" />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
