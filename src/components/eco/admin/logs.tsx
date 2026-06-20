"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Trash2,
  Loader2,
  Bike,
  Lightbulb,
  Leaf,
  Recycle,
  Search,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { AdminLoading } from "../admin-panel";
import { formatDateShort } from "@/lib/stats";

type Log = Awaited<ReturnType<typeof api.adminLogs>>["logs"][number];

export function AdminLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { logs } = await api.adminLogs(Number(days));
      setLogs(logs);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
     
  }, [days]);

  async function remove(id: string) {
    if (!confirm("Delete this log entry?")) return;
    try {
      await api.adminDeleteLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("Log deleted.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const filtered = search
    ? logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(search.toLowerCase()) ||
          l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
          l.date.includes(search)
      )
    : logs;

  const totalCo2 = filtered.reduce((s, l) => s + l.totalCarbon, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search by user or date…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="text-slate-600" size={18} />
            Activity Logs ({filtered.length})
          </CardTitle>
          <CardDescription>
            Total CO₂ in view:{" "}
            <span className="font-semibold text-emerald-700">
              {Math.round(totalCo2 * 100) / 100} kg
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <AdminLoading />
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No logs found.
            </p>
          ) : (
            <div className="eco-scroll max-h-[680px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Transport</th>
                    <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Transport</th>
                    <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Electric</th>
                    <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Food</th>
                    <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Waste</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-right font-medium">·</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 whitespace-nowrap font-medium">
                        {formatDateShort(l.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="truncate font-medium">{l.userName}</div>
                        <div className="truncate text-xs text-muted-foreground">{l.userEmail}</div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <UiBadge variant="secondary" className="text-[10px] capitalize">
                          {l.transportMode ?? "—"} · {l.transportKm} km
                        </UiBadge>
                      </td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        <CatVal icon={Bike} value={l.transportCarbon} />
                      </td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        <CatVal icon={Lightbulb} value={l.electricityCarbon} />
                      </td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        <CatVal icon={Leaf} value={l.foodCarbon} />
                      </td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell">
                        <CatVal icon={Recycle} value={l.wasteCarbon} />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">
                        {l.totalCarbon.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                          onClick={() => remove(l.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CatVal({ icon: Icon, value }: { icon: typeof Bike; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Icon size={12} className="text-muted-foreground" />
      {value.toFixed(2)}
    </span>
  );
}
