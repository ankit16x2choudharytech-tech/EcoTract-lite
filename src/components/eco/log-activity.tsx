"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  Bus,
  Car,
  Train,
  Footprints,
  Lightbulb,
  Fan,
  AirVent,
  Laptop,
  Tv,
  Leaf,
  Recycle,
  Trash2,
  Save,
  Loader2,
  Calendar,
  Sparkles,
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
import { Switch } from "@/components/ui/switch";
import { Badge as UiBadge } from "@/components/ui/badge";
import { useEcoStore, todayStr } from "@/lib/store";
import { api } from "@/lib/api-client";
import { calculateBreakdown, TRANSPORT_FACTORS } from "@/lib/carbon";
import type { DailyLogInput, TransportMode } from "@/lib/types";
import { toast } from "sonner";
import { PageHeader } from "./app-shell";

const TRANSPORT_MODES: { value: TransportMode; label: string; icon: typeof Car; factor: number }[] = [
  { value: "car", label: "Car", icon: Car, factor: TRANSPORT_FACTORS.car },
  { value: "bike", label: "Bike", icon: Bike, factor: TRANSPORT_FACTORS.bike },
  { value: "bus", label: "Bus", icon: Bus, factor: TRANSPORT_FACTORS.bus },
  { value: "metro", label: "Metro", icon: Train, factor: TRANSPORT_FACTORS.metro },
  { value: "train", label: "Train", icon: Train, factor: TRANSPORT_FACTORS.train },
  { value: "walking", label: "Walk", icon: Footprints, factor: 0 },
  { value: "cycling", label: "Cycle", icon: Bike, factor: 0 },
];

export function LogActivityView() {
  const { logs, setLogs, setUser, setBadges, user } = useEcoStore();
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  const existing = logs.find((l) => l.date === date);

  // form state
  const [transportMode, setTransportMode] = useState<TransportMode | null>(
    (existing?.transportMode as TransportMode) ??
      (user?.vehicle as TransportMode) ??
      "bus"
  );
  const [transportKm, setTransportKm] = useState(
    existing?.transportKm ? String(existing.transportKm) : ""
  );
  const [acHours, setAcHours] = useState(existing?.acHours ? String(existing.acHours) : "");
  const [fanHours, setFanHours] = useState(existing?.fanHours ? String(existing.fanHours) : "");
  const [lightHours, setLightHours] = useState(
    existing?.lightHours ? String(existing.lightHours) : ""
  );
  const [laptopHours, setLaptopHours] = useState(
    existing?.laptopHours ? String(existing.laptopHours) : ""
  );
  const [tvHours, setTvHours] = useState(existing?.tvHours ? String(existing.tvHours) : "");
  const [vegMeals, setVegMeals] = useState(existing?.vegMeals ? String(existing.vegMeals) : "");
  const [veganMeals, setVeganMeals] = useState(
    existing?.veganMeals ? String(existing.veganMeals) : ""
  );
  const [nonVegMeals, setNonVegMeals] = useState(
    existing?.nonVegMeals ? String(existing.nonVegMeals) : ""
  );
  const [plasticBags, setPlasticBags] = useState(
    existing?.plasticBags ? String(existing.plasticBags) : ""
  );
  const [glassItems, setGlassItems] = useState(
    existing?.glassItems ? String(existing.glassItems) : ""
  );
  const [paperItems, setPaperItems] = useState(
    existing?.paperItems ? String(existing.paperItems) : ""
  );
  const [recycling, setRecycling] = useState(existing?.recycling ?? false);
  const [composting, setComposting] = useState(existing?.composting ?? false);

  // when date changes, rehydrate from existing log
  useEffect(() => {
    const ex = logs.find((l) => l.date === date);
    setTransportMode((ex?.transportMode as TransportMode) ?? (user?.vehicle as TransportMode) ?? "bus");
    setTransportKm(ex?.transportKm ? String(ex.transportKm) : "");
    setAcHours(ex?.acHours ? String(ex.acHours) : "");
    setFanHours(ex?.fanHours ? String(ex.fanHours) : "");
    setLightHours(ex?.lightHours ? String(ex.lightHours) : "");
    setLaptopHours(ex?.laptopHours ? String(ex.laptopHours) : "");
    setTvHours(ex?.tvHours ? String(ex.tvHours) : "");
    setVegMeals(ex?.vegMeals ? String(ex.vegMeals) : "");
    setVeganMeals(ex?.veganMeals ? String(ex.veganMeals) : "");
    setNonVegMeals(ex?.nonVegMeals ? String(ex.nonVegMeals) : "");
    setPlasticBags(ex?.plasticBags ? String(ex.plasticBags) : "");
    setGlassItems(ex?.glassItems ? String(ex.glassItems) : "");
    setPaperItems(ex?.paperItems ? String(ex.paperItems) : "");
    setRecycling(ex?.recycling ?? false);
    setComposting(ex?.composting ?? false);
     
  }, [date]);

  // live preview
  const preview = calculateBreakdown({
    date,
    transportMode,
    transportKm: num(transportKm),
    acHours: num(acHours),
    fanHours: num(fanHours),
    lightHours: num(lightHours),
    laptopHours: num(laptopHours),
    tvHours: num(tvHours),
    vegMeals: num(vegMeals),
    veganMeals: num(veganMeals),
    nonVegMeals: num(nonVegMeals),
    plasticBags: num(plasticBags),
    glassItems: num(glassItems),
    paperItems: num(paperItems),
    recycling,
    composting,
  });

  async function handleSave() {
    setSaving(true);
    try {
      const body: DailyLogInput = {
        date,
        transportMode,
        transportKm: num(transportKm),
        acHours: num(acHours),
        fanHours: num(fanHours),
        lightHours: num(lightHours),
        laptopHours: num(laptopHours),
        tvHours: num(tvHours),
        vegMeals: num(vegMeals),
        veganMeals: num(veganMeals),
        nonVegMeals: num(nonVegMeals),
        plasticBags: num(plasticBags),
        glassItems: num(glassItems),
        paperItems: num(paperItems),
        recycling,
        composting,
      };
      const res = await api.saveLog(body);
      // update logs cache
      const others = logs.filter((l) => l.date !== date);
      setLogs([...others, res.log].sort((a, b) => a.date.localeCompare(b.date)));
      setUser(res.user);
      // Always show XP earned (+20 new, +5 update) + streak info
      const descParts: string[] = [];
      if (existing) descParts.push("Activity updated");
      else descParts.push("New activity logged");
      if (res.streakUpdated) {
        descParts.push(`🔥 Streak now ${res.user.streak} day${res.user.streak === 1 ? "" : "s"}`);
      }
      toast.success(`+${res.xpAwarded} XP earned! 🌱`, {
        description: descParts.join(" · "),
      });
      if (res.newBadges.length > 0) {
        for (const b of res.newBadges) {
          toast(`🏆 New badge: ${b.name}!`, {
            description: b.description,
          });
        }
        // refresh badges
        try {
          const { badges } = await api.getBadges();
          setBadges(badges);
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Log Daily Activity"
        description="Track your transport, electricity, food and waste for any day."
        action={
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <Input
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto"
            />
          </div>
        }
      />

      {existing && (
        <UiBadge className="mb-4 bg-amber-100 text-amber-700">
          Editing existing log for {date}
        </UiBadge>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Transport */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bike className="text-emerald-600" size={18} />
                Transport
              </CardTitle>
              <CardDescription>How did you travel today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                {TRANSPORT_MODES.map((m) => {
                  const active = transportMode === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setTransportMode(m.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 text-center transition-all ${
                        active
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border hover:border-emerald-300 hover:bg-emerald-50/40"
                      }`}
                    >
                      <m.icon
                        size={20}
                        className={active ? "text-emerald-600" : "text-muted-foreground"}
                      />
                      <span className="text-[11px] font-medium">{m.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-2">
                <Label htmlFor="km">Distance travelled (km)</Label>
                <Input
                  id="km"
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  min={0}
                  value={transportKm}
                  onChange={(e) => setTransportKm(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Factor: {TRANSPORT_FACTORS[transportMode ?? "walking"] ?? 0} kg CO₂/km →{" "}
                  <span className="font-semibold text-emerald-700">
                    {preview.transport.toFixed(2)} kg
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Electricity */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="text-emerald-600" size={18} />
                Electricity
              </CardTitle>
              <CardDescription>Hours of device usage today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <HourField icon={AirVent} label="AC hours" value={acHours} onChange={setAcHours} />
                <HourField icon={Fan} label="Fan hours" value={fanHours} onChange={setFanHours} />
                <HourField icon={Lightbulb} label="Light hours" value={lightHours} onChange={setLightHours} />
                <HourField icon={Laptop} label="Laptop hours" value={laptopHours} onChange={setLaptopHours} />
                <HourField icon={Tv} label="TV hours" value={tvHours} onChange={setTvHours} />
                <div className="flex items-end rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                  <span className="text-sm">
                    <span className="text-muted-foreground">Subtotal: </span>
                    <span className="font-semibold text-emerald-700">
                      {preview.electricity.toFixed(2)} kg CO₂
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="text-emerald-600" size={18} />
                Food
              </CardTitle>
              <CardDescription>Number of meals by type today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <MealField label="🥗 Veg meals" value={vegMeals} onChange={setVegMeals} />
                <MealField label="🌱 Vegan meals" value={veganMeals} onChange={setVeganMeals} />
                <MealField label="🍗 Non-veg meals" value={nonVegMeals} onChange={setNonVegMeals} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Subtotal:{" "}
                <span className="font-semibold text-emerald-700">
                  {preview.food.toFixed(2)} kg CO₂
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Waste */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Recycle className="text-emerald-600" size={18} />
                Waste
              </CardTitle>
              <CardDescription>Items used & eco actions today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <MealField label="🛍️ Plastic bags" value={plasticBags} onChange={setPlasticBags} />
                <MealField label="🥃 Glass items" value={glassItems} onChange={setGlassItems} />
                <MealField label="📄 Paper items" value={paperItems} onChange={setPaperItems} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleRow
                  icon={Recycle}
                  label="Recycled today"
                  desc="Earn -0.5 kg CO₂ credit"
                  checked={recycling}
                  onChange={setRecycling}
                />
                <ToggleRow
                  icon={Leaf}
                  label="Composted today"
                  desc="Earn -0.3 kg CO₂ credit"
                  checked={composting}
                  onChange={setComposting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Subtotal:{" "}
                <span className="font-semibold text-emerald-700">
                  {preview.waste.toFixed(2)} kg CO₂
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Live preview sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20"
          >
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-green-50/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="text-emerald-600" size={18} />
                  Live Carbon Preview
                </CardTitle>
                <CardDescription>Updates as you type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-background p-4 text-center shadow-sm">
                  <div className="text-xs text-muted-foreground">Total for {date}</div>
                  <div className="mt-1 text-4xl font-extrabold text-emerald-600">
                    {preview.total.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">kg CO₂</div>
                </div>
                <div className="space-y-2">
                  <PreviewRow icon={Bike} label="Transport" value={preview.transport} />
                  <PreviewRow icon={Lightbulb} label="Electricity" value={preview.electricity} />
                  <PreviewRow icon={Leaf} label="Food" value={preview.food} />
                  <PreviewRow icon={Recycle} label="Waste" value={preview.waste} />
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  {existing ? "Update log" : "Save activity"}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Earn +20 XP for each new day logged
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function num(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function HourField({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Fan;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs">
        <Icon size={14} className="text-muted-foreground" /> {label}
      </Label>
      <Input
        type="number"
        inputMode="decimal"
        placeholder="0"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MealField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        placeholder="0"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: typeof Recycle;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-emerald-600" />
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-[11px] text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bike;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} className="text-emerald-600" /> {label}
      </span>
      <span className="font-semibold">{value.toFixed(2)} kg</span>
    </div>
  );
}
