"use client";

import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Loader2,
  Shield,
  ShieldCheck,
  Zap,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  Crown,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api-client";
import { useEcoStore } from "@/lib/store";
import type { PublicUser } from "@/lib/types";
import { toast } from "sonner";
import { AdminLoading } from "../admin-panel";

type AdminUser = PublicUser & {
  _count: { dailyLogs: number; goals: number; badges: number };
  monthlyCo2: number;
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | "admin" | "user">("all");
  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [granting, setGranting] = useState(false);
  const [badgeDefs, setBadgeDefs] = useState<Awaited<ReturnType<typeof api.adminBadgeDefs>>["badgeDefs"]>([]);
  const currentUser = useEcoStore((s) => s.user);

  async function load() {
    setLoading(true);
    try {
      const { users } = await api.adminUsers(query, role);
      setUsers(users);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadBadgeDefs() {
    try {
      const { badgeDefs } = await api.adminBadgeDefs();
      setBadgeDefs(badgeDefs);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);

  }, [query, role]);

  // load badge defs once for the grant-badge dropdown
  useEffect(() => {
    loadBadgeDefs();
  }, []);

  async function grantBadge(userId: string, badgeDefId: string, badgeName: string) {
    try {
      const res = await api.adminGrantBadge(userId, badgeDefId);
      if (res.alreadyEarned) {
        toast.info(`${badgeName} already earned by this user.`);
      } else {
        toast.success(`Granted "${badgeName}" badge! 🏆`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function patch(id: string, action: string, value?: number | boolean) {
    try {
      const { user } = await api.adminPatchUser(id, action, value);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)));
      if (detail?.id === id) setDetail((d) => (d ? { ...d, ...user } : null));
      toast.success(`Updated ${user.name}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete ${name}? This removes all their logs, goals, and badges. This cannot be undone.`)) return;
    try {
      await api.adminDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success(`Deleted ${name}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function grantXp(id: string, amount: number) {
    setGranting(true);
    try {
      const { user } = await api.adminPatchUser(id, "grantXp", amount);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...user } : u)));
      if (detail?.id === id) setDetail((d) => (d ? { ...d, ...user } : null));
      toast.success(`Granted ${amount} XP to ${user.name}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGranting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by name, email, or city…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={role} onValueChange={(v) => setRole(v as typeof role)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
              <TabsTrigger value="user">Users</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UsersIcon className="text-slate-600" size={18} />
            Users ({users.length})
          </CardTitle>
          <CardDescription>Manage accounts, XP, streaks & admin status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading />
          ) : users.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          ) : (
            <div className="eco-scroll max-h-[640px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Location</th>
                    <th className="px-4 py-3 text-right font-medium">XP</th>
                    <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Streak</th>
                    <th className="hidden px-4 py-3 text-right font-medium lg:table-cell">Logs</th>
                    <th className="hidden px-4 py-3 text-right font-medium lg:table-cell">Monthly CO₂</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const initials = u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className={`text-xs font-bold text-white ${u.isAdmin ? "bg-gradient-to-br from-slate-600 to-slate-900" : "bg-gradient-to-br from-emerald-400 to-green-600"}`}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 truncate font-medium">
                                {u.name}
                                {u.isAdmin && (
                                  <Crown size={13} className="shrink-0 text-amber-500" />
                                )}
                                {u.id === currentUser?.id && (
                                  <UiBadge variant="secondary" className="text-[10px]">You</UiBadge>
                                )}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {u.city ? `${u.city}, ` : ""}{u.country ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{u.xp}</td>
                        <td className="hidden px-4 py-3 text-right sm:table-cell">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-orange-500">🔥</span> {u.streak}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-right lg:table-cell">{u._count.dailyLogs}</td>
                        <td className="hidden px-4 py-3 text-right lg:table-cell">
                          {u.monthlyCo2 > 0 ? `${u.monthlyCo2} kg` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => setDetail(u)}
                              title="View details"
                            >
                              <Eye size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                              onClick={() => grantXp(u.id, 50)}
                              disabled={granting}
                              title="Grant 50 XP"
                            >
                              <Zap size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-orange-600 hover:bg-orange-50"
                              onClick={() => patch(u.id, "resetStreak")}
                              title="Reset streak"
                            >
                              <RotateCcw size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-8 w-8 ${u.isAdmin ? "text-slate-600" : "text-slate-400"} hover:bg-slate-100`}
                              onClick={() => patch(u.id, "toggleAdmin")}
                              disabled={u.id === currentUser?.id}
                              title={u.isAdmin ? "Revoke admin" : "Make admin"}
                            >
                              {u.isAdmin ? <ShieldCheck size={15} /> : <Shield size={15} />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => remove(u.id, u.name)}
                              disabled={u.id === currentUser?.id}
                              title="Delete user"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`text-xs font-bold text-white ${detail.isAdmin ? "bg-gradient-to-br from-slate-600 to-slate-900" : "bg-gradient-to-br from-emerald-400 to-green-600"}`}>
                      {detail.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {detail.name}
                  {detail.isAdmin && <Crown size={16} className="text-amber-500" />}
                </DialogTitle>
                <DialogDescription>{detail.email}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="text-sm font-semibold">Profile</h4>
                  <DetailRow label="Age" value={detail.age ? String(detail.age) : "—"} />
                  <DetailRow label="Occupation" value={detail.occupation ?? "—"} />
                  <DetailRow label="City" value={detail.city ?? "—"} />
                  <DetailRow label="Country" value={detail.country ?? "—"} />
                  <DetailRow label="Diet" value={detail.diet ?? "—"} />
                  <DetailRow label="Vehicle" value={detail.vehicle ?? "—"} />
                  <DetailRow label="Joined" value={new Date(detail.createdAt).toLocaleDateString()} />
                  <DetailRow label="Last active" value={detail.lastActiveDate ?? "—"} />
                </div>
                <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="text-sm font-semibold">Stats</h4>
                  <DetailRow label="XP" value={String(detail.xp)} />
                  <DetailRow label="Streak" value={`${detail.streak} days`} />
                  <DetailRow label="Onboarded" value={detail.onboarded ? "Yes" : "No"} />
                  <DetailRow label="Admin" value={detail.isAdmin ? "Yes" : "No"} />
                  <DetailRow label="Logs" value={String(detail._count.dailyLogs)} />
                  <DetailRow label="Goals" value={String(detail._count.goals)} />
                  <DetailRow label="Badges" value={String(detail._count.badges)} />
                  <DetailRow label="Monthly CO₂" value={`${detail.monthlyCo2} kg`} />
                </div>
              </div>

              {/* Quick actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Quick actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => grantXp(detail.id, 100)}
                    disabled={granting}
                  >
                    <Zap size={14} className="mr-1" /> +100 XP
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => grantXp(detail.id, 500)} disabled={granting}>
                    <Zap size={14} className="mr-1" /> +500 XP
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => patch(detail.id, "resetStreak")}>
                    <RotateCcw size={14} className="mr-1" /> Reset streak
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => patch(detail.id, "toggleOnboarded")}>
                    <CheckCircle2 size={14} className="mr-1" /> Toggle onboarded
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patch(detail.id, "toggleAdmin")}
                    disabled={detail.id === currentUser?.id}
                  >
                    <Shield size={14} className="mr-1" />
                    {detail.isAdmin ? "Revoke admin" : "Make admin"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      remove(detail.id, detail.name);
                      setDetail(null);
                    }}
                    disabled={detail.id === currentUser?.id}
                  >
                    <Trash2 size={14} className="mr-1" /> Delete account
                  </Button>
                </div>
              </div>

              {/* Grant badge */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Award size={14} className="text-amber-500" /> Grant badge
                </h4>
                <div className="flex flex-wrap gap-2">
                  {badgeDefs.length === 0 && (
                    <p className="text-xs text-muted-foreground">Loading badges…</p>
                  )}
                  {badgeDefs.map((bd) => (
                    <Button
                      key={bd.id}
                      size="sm"
                      variant="outline"
                      className="border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => grantBadge(detail.id, bd.id, bd.name)}
                      title={bd.description || bd.name}
                    >
                      🏆 {bd.name}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetail(null)}>
                  <X size={14} className="mr-1" /> Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
