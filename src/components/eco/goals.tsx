"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Plus,
  Check,
  RotateCcw,
  Trash2,
  Loader2,
  Trophy,
  Zap,
  Bike,
  Footprints,
  Recycle,
  Lightbulb,
  Leaf,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as UiBadge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEcoStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { GOAL_TEMPLATES } from "@/lib/carbon";
import type { Goal } from "@/lib/types";
import { toast } from "sonner";
import { PageHeader } from "./app-shell";

const TYPE_ICONS: Record<string, typeof Bike> = {
  bicycle: Bike,
  walk: Footprints,
  noplastic: Recycle,
  lights: Lightbulb,
  vegday: Leaf,
  custom: Target,
};

export function GoalsView() {
  const { goals, setGoals, setUser } = useEcoStore();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    type: "custom",
    target: "7",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { goals } = await api.getGoals();
        if (mounted) setGoals(goals);
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

  async function createGoal() {
    if (!newGoal.title.trim()) {
      toast.error("Please enter a goal title.");
      return;
    }
    try {
      const { goal } = await api.createGoal({
        title: newGoal.title,
        description: newGoal.description || undefined,
        type: newGoal.type,
        target: Number(newGoal.target) || 7,
        xp: 50,
      });
      setGoals([goal, ...goals]);
      toast.success("Goal created! 🎯");
      setDialogOpen(false);
      setNewGoal({ title: "", description: "", type: "custom", target: "7" });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function createFromTemplate(t: (typeof GOAL_TEMPLATES)[number]) {
    try {
      const { goal } = await api.createGoal({
        title: t.title,
        description: t.description,
        type: t.type,
        target: t.target,
        xp: t.xp,
      });
      setGoals([goal, ...goals]);
      toast.success("Goal added from template! 🎯");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function increment(g: Goal) {
    try {
      const res = await api.patchGoal(g.id, "increment");
      setGoals(goals.map((x) => (x.id === g.id ? res.goal : x)));
      setUser(res.user);
      if (res.xpAwarded > 0) {
        toast.success(`🎉 Goal complete! +${res.xpAwarded} XP`, {
          description: "Keep up the great work!",
        });
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function complete(g: Goal) {
    try {
      const res = await api.patchGoal(g.id, "complete");
      setGoals(goals.map((x) => (x.id === g.id ? res.goal : x)));
      setUser(res.user);
      if (res.xpAwarded > 0) {
        toast.success(`🎉 Goal complete! +${res.xpAwarded} XP`);
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function reset(g: Goal) {
    try {
      const { goal } = await api.patchGoal(g.id, "reset");
      setGoals(goals.map((x) => (x.id === g.id ? goal : x)));
      toast.info("Goal reset.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function remove(g: Goal) {
    try {
      await api.deleteGoal(g.id);
      setGoals(goals.filter((x) => x.id !== g.id));
      toast.info("Goal removed.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const active = goals.filter((g) => !g.completed);
  const done = goals.filter((g) => g.completed);

  return (
    <div>
      <PageHeader
        title="Goals"
        description="Set sustainable goals, track progress, and earn XP."
        action={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus size={16} className="mr-2" /> New goal
          </Button>
        }
      />

      {/* Templates */}
      <Card className="mb-6 border-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="text-emerald-600" size={18} />
            Quick-start templates
          </CardTitle>
          <CardDescription>
            Add a ready-made eco goal with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GOAL_TEMPLATES.map((t) => {
              const Icon = TYPE_ICONS[t.type] ?? Target;
              const exists = goals.some(
                (g) => g.type === t.type && !g.completed
              );
              return (
                <button
                  key={t.type}
                  onClick={() => !exists && createFromTemplate(t)}
                  disabled={exists}
                  className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    exists
                      ? "border-muted bg-muted/40 opacity-60"
                      : "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/40"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight">
                      {t.title}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t.description}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <UiBadge variant="secondary" className="text-[10px]">
                        {t.target} days
                      </UiBadge>
                      <UiBadge className="bg-amber-100 text-amber-700 text-[10px]">
                        <Zap size={10} className="mr-0.5" /> {t.xp} XP
                      </UiBadge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : goals.length === 0 ? (
        <Card className="border-emerald-100">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-500">
              <Target size={26} />
            </span>
            <div>
              <div className="font-semibold">No goals yet</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a template above or create a custom goal to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Target size={16} /> Active ({active.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    onIncrement={() => increment(g)}
                    onComplete={() => complete(g)}
                    onReset={() => reset(g)}
                    onDelete={() => remove(g)}
                  />
                ))}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Award size={16} /> Completed ({done.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {done.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    onIncrement={() => {}}
                    onComplete={() => {}}
                    onReset={() => reset(g)}
                    onDelete={() => remove(g)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New goal dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a custom goal</DialogTitle>
            <DialogDescription>
              Set your own sustainability target and earn XP on completion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="g-title">Goal title</Label>
              <Input
                id="g-title"
                placeholder="Take stairs instead of elevator for 14 days"
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-desc">Description (optional)</Label>
              <Input
                id="g-desc"
                placeholder="Why this goal matters to you"
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="g-target">Target (days/actions)</Label>
                <Input
                  id="g-target"
                  type="number"
                  min={1}
                  value={newGoal.target}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, target: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Xp reward</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm">
                  <Zap size={14} className="mr-1 text-amber-500" /> 50 XP
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createGoal}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Create goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalCard({
  goal,
  onIncrement,
  onComplete,
  onReset,
  onDelete,
}: {
  goal: Goal;
  onIncrement: () => void;
  onComplete: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const Icon = TYPE_ICONS[goal.type] ?? Target;
  const pct = goal.target > 0 ? Math.min(100, (goal.progress / goal.target) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className={`border-emerald-100 ${
          goal.completed ? "bg-emerald-50/40" : ""
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                  goal.completed
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {goal.completed ? <Check size={20} /> : <Icon size={20} />}
              </span>
              <div>
                <h3 className="font-semibold leading-tight">{goal.title}</h3>
                {goal.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {goal.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <UiBadge variant="secondary" className="text-[10px]">
                    {goal.progress}/{goal.target}
                  </UiBadge>
                  <UiBadge className="bg-amber-100 text-amber-700 text-[10px]">
                    <Zap size={10} className="mr-0.5" /> {goal.xp} XP
                  </UiBadge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={pct} className="h-2" />
          </div>

          <div className="mt-4 flex items-center gap-2">
            {!goal.completed && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={onIncrement}
                  disabled={goal.progress >= goal.target}
                >
                  <Plus size={14} className="mr-1" /> Progress
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onComplete}
                  className="text-emerald-700 hover:bg-emerald-50"
                >
                  <Check size={14} className="mr-1" /> Mark done
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={onReset}>
              <RotateCcw size={14} className="mr-1" /> Reset
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-muted-foreground hover:text-red-600"
              onClick={onDelete}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
