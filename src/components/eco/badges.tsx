"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sprout,
  Compass,
  Sword,
  Shield,
  Award,
  Loader2,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { useEcoStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { Badge } from "@/lib/types";
import { toast } from "sonner";
import { PageHeader } from "./app-shell";

const ICONS: Record<string, typeof Sprout> = {
  Sprout,
  Compass,
  Sword,
  Shield,
  Award,
};

export function BadgesView() {
  const { badges, setBadges } = useEcoStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { badges } = await api.getBadges();
        if (mounted) setBadges(badges);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
     
  }, []);

  const earned = badges.filter((b) => b.earned);

  return (
    <div>
      <PageHeader
        title="Badges"
        description="Celebrate your milestones and unlock new achievements."
      />

      {/* Summary card */}
      <Card className="mb-6 border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-green-50/40">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white">
              <Award size={28} />
            </span>
            <div>
              <div className="text-3xl font-extrabold">
                {earned.length}
                <span className="text-lg text-muted-foreground">
                  /{badges.length}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Badges earned
              </div>
            </div>
          </div>
          <UiBadge className="bg-emerald-100 text-emerald-700">
            {badges.length > 0
              ? Math.round((earned.length / badges.length) * 100)
              : 0}
            % complete
          </UiBadge>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b, i) => (
            <BadgeCard key={b.name} badge={b} delay={i * 0.06} />
          ))}
        </div>
      )}

      {/* Streak rewards info */}
      <Card className="mt-8 border-emerald-100">
        <CardHeader>
          <CardTitle className="text-lg">Streak reward tiers</CardTitle>
          <CardDescription>
            Keep your daily login + activity streak alive for bonus XP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { days: 7, xp: 50, label: "Week Warrior" },
              { days: 30, xp: 200, label: "Eco Master" },
              { days: 100, xp: 500, label: "Planet Guardian" },
            ].map((t) => (
              <div
                key={t.days}
                className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center"
              >
                <div className="text-2xl font-extrabold text-emerald-600">
                  {t.days} days
                </div>
                <div className="text-sm font-medium">{t.label}</div>
                <UiBadge className="mt-2 bg-amber-100 text-amber-700">
                  +{t.xp} XP
                </UiBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BadgeCard({ badge, delay }: { badge: Badge; delay: number }) {
  const Icon = ICONS[badge.icon] ?? Award;
  const earned = badge.earned;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={`relative h-full overflow-hidden border-emerald-100 transition-all ${
          earned ? "hover:shadow-md" : "opacity-80"
        }`}
      >
        {earned && (
          <div className="eco-grid-bg absolute inset-0 opacity-40" aria-hidden />
        )}
        <CardContent className="relative flex flex-col items-center gap-3 p-6 text-center">
          <span
            className={`grid h-16 w-16 place-items-center rounded-full ${
              earned
                ? "bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {earned ? <Icon size={30} /> : <Lock size={24} />}
          </span>
          <div>
            <h3 className="font-bold">{badge.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {badge.description}
            </p>
          </div>
          {earned ? (
            <UiBadge className="bg-emerald-100 text-emerald-700">
              🏆 Earned
              {badge.earnedAt &&
                ` · ${new Date(badge.earnedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`}
            </UiBadge>
          ) : (
            <UiBadge variant="secondary">🔒 Locked</UiBadge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
