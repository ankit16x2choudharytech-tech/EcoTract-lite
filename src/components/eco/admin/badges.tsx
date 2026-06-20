"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Sprout,
  Compass,
  Sword,
  Shield,
  Trophy,
  Star,
  Crown,
  Medal,
  Leaf,
  Flame,
  Target,
  Heart,
  Zap,
  Sun,
  Moon,
  Globe,
  Recycle,
  Plus,
  Trash2,
  Loader2,
  Lock,
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
import { Badge as UiBadge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { AdminLoading } from "../admin-panel";

const ICONS: Record<string, typeof Sprout> = {
  Sprout, Compass, Sword, Shield, Award, Trophy, Star, Crown, Medal,
  Leaf, Flame, Target, Heart, Zap, Sun, Moon, Globe, Recycle,
};

const ICON_OPTIONS = Object.keys(ICONS);

const CRITERIA_LABELS: Record<string, string> = {
  manual: "Manual (admin grants)",
  loggedDays: "Logged Days",
  streak: "Streak",
  totalXp: "Total XP",
};

type BadgeDef = Awaited<ReturnType<typeof api.adminBadgeDefs>>["badgeDefs"][number];

export function AdminBadges() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.adminBadges>> | null>(null);
  const [defs, setDefs] = useState<BadgeDef[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  async function loadAll() {
    try {
      const [badgesRes, defsRes] = await Promise.all([
        api.adminBadges(),
        api.adminBadgeDefs(),
      ]);
      setData(badgesRes);
      setDefs(defsRes.badgeDefs);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [badgesRes, defsRes] = await Promise.all([
          api.adminBadges(),
          api.adminBadgeDefs(),
        ]);
        if (!mounted) return;
        setData(badgesRes);
        setDefs(defsRes.badgeDefs);
      } catch (e) {
        if (mounted) toast.error((e as Error).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function deleteDef(id: string, name: string) {
    if (!confirm(`Delete the "${name}" badge? Already-awarded instances will remain but become unlinked.`)) return;
    try {
      await api.adminDeleteBadgeDef(id);
      setDefs((prev) => prev.filter((d) => d.id !== id));
      toast.success(`Deleted badge "${name}"`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!data) return <AdminLoading />;

  return (
    <div className="space-y-6">
      {/* Badge definitions management */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="text-emerald-600" size={18} />
              Badge Definitions
            </CardTitle>
            <CardDescription>
              Create custom badges users can earn. {defs.length} total ({defs.filter((d) => !d.isDefault).length} custom)
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setDialogOpen(true)}
          >
            <Plus size={14} className="mr-1" /> New badge
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {defs.map((d) => {
              const Icon = ICONS[d.icon] ?? Award;
              return (
                <div
                  key={d.id}
                  className={`relative rounded-xl border-2 p-4 ${
                    d.isDefault ? "border-slate-100 bg-slate-50/40" : "border-emerald-100 bg-emerald-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-md ${
                      d.isDefault ? "bg-gradient-to-br from-slate-400 to-slate-600" : "bg-gradient-to-br from-emerald-400 to-green-600"
                    }`}>
                      <Icon size={20} />
                    </span>
                    {!d.isDefault && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:bg-red-50"
                        onClick={() => deleteDef(d.id, d.name)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 font-semibold">{d.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {d.description || "No description"}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <UiBadge variant="secondary" className="text-[10px]">
                      {CRITERIA_LABELS[d.criteria] ?? d.criteria}
                    </UiBadge>
                    {d.criteria !== "manual" && (
                      <UiBadge className="bg-emerald-100 text-emerald-700 text-[10px]">
                        ≥ {d.threshold}
                      </UiBadge>
                    )}
                    <UiBadge variant="outline" className="text-[10px]">
                      {d.awardedCount}× awarded
                    </UiBadge>
                    {d.isDefault && (
                      <UiBadge variant="outline" className="text-[10px] text-slate-500">
                        <Lock size={9} className="mr-0.5" /> default
                      </UiBadge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge distribution */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="text-amber-500" size={18} />
            Award Distribution
          </CardTitle>
          <CardDescription>
            {data.stats.total} badges awarded across {new Set(data.badges.map((b) => b.userEmail)).size} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.stats.byName.map((b) => {
              const def = defs.find((d) => d.name === b.name);
              const Icon = ICONS[def?.icon ?? "Award"] ?? Award;
              return (
                <div
                  key={b.name}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 text-center"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                    <Icon size={22} />
                  </span>
                  <div className="text-sm font-semibold">{b.name}</div>
                  <UiBadge className="bg-amber-100 text-amber-700">{b.count} awarded</UiBadge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All awards table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="text-slate-600" size={18} />
            All Badge Awards
          </CardTitle>
          <CardDescription>Chronological log of every badge earned</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="eco-scroll max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Badge</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Earned</th>
                </tr>
              </thead>
              <tbody>
                {data.badges.map((b) => (
                  <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <UiBadge className="bg-amber-100 text-amber-700">🏆 {b.name}</UiBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate font-medium">{b.userName}</div>
                      <div className="truncate text-xs text-muted-foreground">{b.userEmail}</div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {b.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {new Date(b.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create badge dialog */}
      <CreateBadgeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        creating={creating}
        onCreating={setCreating}
        onCreated={(def) => {
          setDefs((prev) => [...prev, def as BadgeDef]);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}

function CreateBadgeDialog({
  open,
  onOpenChange,
  creating,
  onCreating,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  creating: boolean;
  onCreating: (v: boolean) => void;
  onCreated: (def: unknown) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Award");
  const [criteria, setCriteria] = useState("manual");
  const [threshold, setThreshold] = useState("0");

  async function create() {
    if (!name.trim()) {
      toast.error("Badge name is required.");
      return;
    }
    onCreating(true);
    try {
      const res = await api.adminCreateBadgeDef({
        name,
        description: description || undefined,
        icon,
        criteria,
        threshold: criteria === "manual" ? 0 : Number(threshold) || 0,
      });
      onCreated(res.badgeDef);
      toast.success(`Badge "${res.badgeDef.name}" created! 🏆`);
      setName(""); setDescription(""); setIcon("Award"); setCriteria("manual"); setThreshold("0");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      onCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="text-emerald-600" size={18} /> Create New Badge
          </DialogTitle>
          <DialogDescription>
            Define a new achievement badge that users can earn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="b-name">Badge name *</Label>
            <Input
              id="b-name"
              placeholder="e.g. Climate Champion"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="b-desc">Description</Label>
            <Input
              id="b-desc"
              placeholder="e.g. Awarded for exceptional commitment to reducing CO₂"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {ICON_OPTIONS.map((ic) => {
                    const I = ICONS[ic];
                    return (
                      <SelectItem key={ic} value={ic}>
                        <span className="flex items-center gap-2"><I size={14} /> {ic}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Award criteria</Label>
              <Select value={criteria} onValueChange={setCriteria}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (admin grants)</SelectItem>
                  <SelectItem value="loggedDays">Logged Days</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="totalXp">Total XP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {criteria !== "manual" && (
            <div className="space-y-2">
              <Label htmlFor="b-threshold">
                Threshold ({criteria === "loggedDays" ? "days" : criteria === "streak" ? "days" : "XP"})
              </Label>
              <Input
                id="b-threshold"
                type="number"
                min={1}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Auto-awarded when user reaches {threshold} {criteria === "loggedDays" ? "logged days" : criteria === "streak" ? "day streak" : "XP"}.
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
            {(() => {
              const I = ICONS[icon] ?? Award;
              return (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-md">
                  <I size={20} />
                </span>
              );
            })()}
            <div>
              <div className="font-semibold">{name || "Badge name"}</div>
              <div className="text-xs text-muted-foreground">{description || "Description preview"}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
            {creating && <Loader2 className="mr-2 animate-spin" size={14} />}
            Create badge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
