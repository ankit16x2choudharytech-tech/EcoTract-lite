"use client";

import { useEffect, useState } from "react";
import {
  Target,
  CheckCircle2,
  Loader2,
  Bike,
  Footprints,
  Recycle,
  Lightbulb,
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
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { AdminLoading } from "../admin-panel";

const TYPE_ICONS: Record<string, typeof Bike> = {
  bicycle: Bike,
  walk: Footprints,
  noplastic: Recycle,
  lights: Lightbulb,
  vegday: Leaf,
  custom: Target,
};

export function AdminGoals() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminGoals>> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await api.adminGoals();
        if (mounted) setData(d);
      } catch (e) {
        toast.error((e as Error).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) return <AdminLoading />;

  const completionRate = data.stats.total > 0 ? Math.round((data.stats.completed / data.stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Total Goals" value={data.stats.total} tint="bg-blue-100 text-blue-700" />
        <SummaryCard label="Completed" value={data.stats.completed} tint="bg-emerald-100 text-emerald-700" />
        <SummaryCard label="Completion Rate" value={`${completionRate}%`} tint="bg-amber-100 text-amber-700" />
        <SummaryCard label="Goal Types" value={data.stats.byType.length} tint="bg-purple-100 text-purple-700" />
      </div>

      {/* By type breakdown */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="text-slate-600" size={18} />
            Goals by Type
          </CardTitle>
          <CardDescription>How users are engaging with each goal category</CardDescription>
        </CardHeader>
        <CardContent>
          {data.stats.byType.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No goals yet.</p>
          ) : (
            <div className="space-y-4">
              {data.stats.byType.map((t) => {
                const Icon = TYPE_ICONS[t.type] ?? Target;
                const pct = t.count > 0 ? Math.round((t.completed / t.count) * 100) : 0;
                return (
                  <div key={t.type}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium capitalize">
                        <Icon size={16} className="text-emerald-600" /> {t.type}
                      </span>
                      <span className="text-muted-foreground">
                        {t.completed}/{t.count} completed ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All goals table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">All Goals</CardTitle>
          <CardDescription>Every goal created across the platform</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="eco-scroll max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Goal</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">User</th>
                  <th className="px-4 py-3 text-right font-medium">Progress</th>
                  <th className="px-4 py-3 text-right font-medium">XP</th>
                  <th className="px-4 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.goals.map((g) => {
                  const Icon = TYPE_ICONS[g.type] ?? Target;
                  const pct = g.target > 0 ? Math.min(100, Math.round((g.progress / g.target) * 100)) : 0;
                  return (
                    <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon size={15} className="shrink-0 text-emerald-600" />
                          <span className="font-medium">{g.title}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                          {g.userName}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <div className="truncate font-medium">{g.userName}</div>
                        <div className="truncate text-xs text-muted-foreground">{g.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-medium">{g.progress}/{g.target}</span>
                        <Progress value={pct} className="mt-1 h-1.5 w-20" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <UiBadge className="bg-amber-100 text-amber-700">{g.xp}</UiBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {g.completed ? (
                          <UiBadge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle2 size={11} className="mr-1" /> Done
                          </UiBadge>
                        ) : (
                          <UiBadge variant="secondary">Active</UiBadge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, tint }: { label: string; value: string | number; tint: string }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</span>
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${tint}`}>
            <Target size={16} />
          </span>
        </div>
        <div className="mt-2 text-2xl font-bold sm:text-3xl">{value}</div>
      </CardContent>
    </Card>
  );
}
