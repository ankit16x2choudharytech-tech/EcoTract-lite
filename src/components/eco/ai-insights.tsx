"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Bot,
  FileText,
  TrendingDown,
  Target,
  Lightbulb,
  Loader2,
  Calendar,
  ArrowDownRight,
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
import { Separator } from "@/components/ui/separator";
import { useEcoStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { AIInsights, WeeklyReport, AIRecommendation } from "@/lib/types";
import { toast } from "sonner";
import { PageHeader } from "./app-shell";

export function AiInsightsView() {
  const logs = useEcoStore((s) => s.logs);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const hasLogs = logs.length > 0;

  async function loadRecs() {
    setLoadingRecs(true);
    try {
      const data = await api.aiRecommendations();
      setInsights(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoadingRecs(false);
    }
  }

  async function loadReport() {
    setLoadingReport(true);
    try {
      const data = await api.aiWeeklyReport();
      setReport(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoadingReport(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Insights"
        description="Personalized recommendations and weekly reports powered by AI."
      />

      {!hasLogs && (
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Lightbulb className="text-amber-600" size={20} />
            <p className="text-sm text-amber-800">
              Log at least one day of activity to unlock AI-powered insights
              tailored to your habits.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recommendations */}
        <div className="lg:col-span-3">
          <Card className="h-full border-emerald-100">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="text-emerald-600" size={18} />
                  AI Recommendations
                </CardTitle>
                <CardDescription>
                  Top 5 personalized tips with estimated monthly savings
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadRecs}
                disabled={loadingRecs || !hasLogs}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                {loadingRecs ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <RefreshCw size={14} className="mr-1" />
                )}
                {insights ? "Refresh" : "Generate"}
              </Button>
            </CardHeader>
            <CardContent>
              {!insights && !loadingRecs && (
                <EmptyState
                  icon={Sparkles}
                  title="No recommendations yet"
                  desc="Click Generate to get 5 AI-powered tips based on your recent activity."
                  action={
                    <Button
                      onClick={loadRecs}
                      disabled={!hasLogs}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Sparkles size={16} className="mr-2" /> Generate tips
                    </Button>
                  }
                />
              )}
              {loadingRecs && (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Loader2 className="animate-spin text-emerald-600" size={28} />
                  <p className="text-sm text-muted-foreground">
                    Analyzing your week with AI…
                  </p>
                </div>
              )}
              {insights && !loadingRecs && (
                <div className="space-y-3">
                  {insights.recommendations.map((r, i) => (
                    <RecommendationCard key={i} rec={r} index={i} />
                  ))}
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-4">
                    <p className="text-sm font-medium text-emerald-800">
                      💬 {insights.motivationalMessage}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly report */}
        <div className="lg:col-span-2">
          <Card className="h-full border-emerald-100">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="text-emerald-600" size={18} />
                  AI Weekly Report
                </CardTitle>
                <CardDescription>Your Sunday sustainability summary</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadReport}
                disabled={loadingReport || !hasLogs}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                {loadingReport ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <RefreshCw size={14} className="mr-1" />
                )}
                {report ? "Refresh" : "Generate"}
              </Button>
            </CardHeader>
            <CardContent>
              {!report && !loadingReport && (
                <EmptyState
                  icon={Calendar}
                  title="No report yet"
                  desc="Generate your AI weekly report to see progress and goals."
                  action={
                    <Button
                      onClick={loadReport}
                      disabled={!hasLogs}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <FileText size={16} className="mr-2" /> Generate report
                    </Button>
                  }
                />
              )}
              {loadingReport && (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Loader2 className="animate-spin text-emerald-600" size={28} />
                  <p className="text-sm text-muted-foreground">
                    Writing your weekly report…
                  </p>
                </div>
              )}
              {report && !loadingReport && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 p-4 text-white">
                    <div className="text-xs uppercase tracking-wide text-emerald-100">
                      Weekly carbon
                    </div>
                    <div className="mt-1 text-3xl font-extrabold">
                      {report.weeklyCarbon.toFixed(1)}{" "}
                      <span className="text-lg font-medium">kg CO₂</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <ReportRow
                      icon={TrendingDown}
                      label="Top emission source"
                      value={report.topEmissionSource}
                    />
                    <Separator />
                    <ReportRow
                      icon={Target}
                      label="Biggest improvement"
                      value={report.biggestImprovement}
                    />
                    <Separator />
                    <ReportRow
                      icon={Target}
                      label="Next week goal"
                      value={report.nextWeekGoal}
                    />
                  </div>
                  <div className="rounded-xl bg-emerald-50/60 p-4">
                    <div className="text-xs font-semibold text-emerald-700">
                      Summary
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {report.summary}
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, index }: { rec: AIRecommendation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-emerald-100 p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            {index + 1}
          </span>
          <div>
            <h4 className="font-semibold leading-tight">{rec.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{rec.detail}</p>
          </div>
        </div>
        <UiBadge className="shrink-0 bg-emerald-100 text-emerald-700">
          <ArrowDownRight size={12} className="mr-1" />
          {rec.estimatedSavingKgPerMonth} kg/mo
        </UiBadge>
      </div>
    </motion.div>
  );
}

function ReportRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingDown;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
        <Icon size={16} />
      </span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: typeof Sparkles;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-500">
        <Icon size={26} />
      </span>
      <div>
        <div className="font-semibold">{title}</div>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          {desc}
        </p>
      </div>
      {action}
    </div>
  );
}
