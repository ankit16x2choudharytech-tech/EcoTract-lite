"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Zap,
  TrendingDown,
  Loader2,
  Medal,
  Crown,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEcoStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { LeaderboardEntry } from "@/lib/types";
import { toast } from "sonner";
import { PageHeader } from "./app-shell";

type SortKey = "xp" | "streak" | "lowest" | "improvement";

const SORTS: { key: SortKey; label: string; icon: typeof Trophy; desc: string }[] = [
  { key: "xp", label: "Top XP", icon: Zap, desc: "Most experienced eco-warriors" },
  { key: "streak", label: "Longest Streak", icon: Flame, desc: "Who's been most consistent" },
  { key: "lowest", label: "Lowest Emissions", icon: Leaf, desc: "Smallest monthly footprint" },
  { key: "improvement", label: "Biggest Improvement", icon: TrendingDown, desc: "Most reduced vs last month" },
];

export function LeaderboardView() {
  const setLeaderboard = useEcoStore((s) => s.setLeaderboard);
  const leaderboard = useEcoStore((s) => s.leaderboard);
  const [sort, setSort] = useState<SortKey>("xp");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { leaderboard } = await api.getLeaderboard(sort);
        if (mounted) setLeaderboard(leaderboard);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
     
  }, [sort]);

  const current = SORTS.find((s) => s.key === sort)!;
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="Compete with the community and climb the ranks."
      />

      <Tabs value={sort} onValueChange={(v) => setSort(v as SortKey)} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          {SORTS.map((s) => (
            <TabsTrigger key={s.key} value={s.key} className="gap-1.5">
              <s.icon size={14} />
              <span className="hidden sm:inline">{s.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <p className="mb-4 text-sm text-muted-foreground">{current.desc}</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : leaderboard.length === 0 ? (
        <Card className="border-emerald-100">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Trophy className="text-muted-foreground/40" size={40} />
            <p className="text-sm text-muted-foreground">
              No entries yet. Be the first!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && sort === "xp" && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {top3.map((e, i) => (
                <PodiumCard key={e.id} entry={e} place={i + 1} />
              ))}
            </div>
          )}

          {/* Full table */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-lg">Full ranking</CardTitle>
              <CardDescription>
                {leaderboard.length} eco-warriors competing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="eco-scroll max-h-[520px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50 backdrop-blur">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Rank</th>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 text-right font-medium">
                        XP
                      </th>
                      <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                        Streak
                      </th>
                      <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                        Monthly CO₂
                      </th>
                      <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                        Improvement
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((e) => (
                      <tr
                        key={e.id}
                        className={`border-t border-emerald-50 transition-colors ${
                          e.isCurrentUser
                            ? "bg-emerald-50/60"
                            : "hover:bg-muted/40"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 font-semibold">
                            {e.rank <= 3 && <Medal size={14} className={medalColor(e.rank)} />}
                            #{e.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-green-600 text-[11px] font-bold text-white">
                                {e.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {e.name}
                                {e.isCurrentUser && (
                                  <span className="ml-1.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold">{e.xp}</span>
                        </td>
                        <td className="hidden px-4 py-3 text-right sm:table-cell">
                          <span className="inline-flex items-center gap-1">
                            <Flame size={12} className="text-orange-500" />
                            {e.streak}d
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-right md:table-cell">
                          {e.monthlyCarbon > 0
                            ? `${e.monthlyCarbon.toFixed(1)} kg`
                            : "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-right md:table-cell">
                          {e.improvement > 0 ? (
                            <span className="text-emerald-600">
                              ↓ {e.improvement} kg
                            </span>
                          ) : e.improvement < 0 ? (
                            <span className="text-amber-600">
                              ↑ {Math.abs(e.improvement)} kg
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: number }) {
  const heights = ["sm:mt-8", "sm:mt-0", "sm:mt-12"];
  const styles = [
    {
      ring: "from-amber-300 to-amber-500",
      badge: "bg-amber-100 text-amber-700",
      icon: Crown,
      label: "🥇 Champion",
    },
    {
      ring: "from-slate-300 to-slate-500",
      badge: "bg-slate-100 text-slate-700",
      icon: Medal,
      label: "🥈 Runner-up",
    },
    {
      ring: "from-orange-300 to-orange-600",
      badge: "bg-orange-100 text-orange-700",
      icon: Medal,
      label: "🥉 Third place",
    },
  ];
  const s = styles[place - 1];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (place - 1) * 0.1 }}
      className={heights[place - 1]}
    >
      <Card
        className={`border-emerald-100 text-center ${
          entry.isCurrentUser ? "ring-2 ring-emerald-400" : ""
        }`}
      >
        <CardContent className="flex flex-col items-center gap-2 p-5">
          <div
            className={`grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${s.ring} text-white shadow-lg`}
          >
            <s.icon size={28} />
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            {s.label}
          </div>
          <div className="font-bold">{entry.name}</div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
              <Zap size={10} className="mr-0.5 inline" />
              {entry.xp} XP
            </span>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
              <Flame size={10} className="mr-0.5 inline" />
              {entry.streak}d
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function medalColor(rank: number): string {
  if (rank === 1) return "text-amber-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-orange-600";
  return "text-muted-foreground";
}
