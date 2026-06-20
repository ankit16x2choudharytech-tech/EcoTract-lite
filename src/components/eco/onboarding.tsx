"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Leaf,
  Bike,
  Bus,
  Car,
  Train,
  Footprints,
  Accessibility,
  CheckCircle2,
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
import { Brand } from "./brand";
import { useEcoStore, todayStr } from "@/lib/store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import type { DietPref, VehicleType } from "@/lib/types";

const STEPS = ["About you", "Diet", "Transport", "Review"] as const;

const DIET_OPTIONS: { value: DietPref; label: string; emoji: string; desc: string }[] = [
  { value: "veg", label: "Vegetarian", emoji: "🥗", desc: "Plant-based + dairy" },
  { value: "vegan", label: "Vegan", emoji: "🌱", desc: "Fully plant-based" },
  { value: "nonveg", label: "Non-Vegetarian", emoji: "🍗", desc: "Includes meat" },
];

const VEHICLE_OPTIONS: { value: VehicleType; label: string; icon: typeof Car }[] = [
  { value: "car", label: "Car", icon: Car },
  { value: "bike", label: "Bike", icon: Bike },
  { value: "bus", label: "Bus", icon: Bus },
  { value: "metro", label: "Metro", icon: Train },
  { value: "train", label: "Train", icon: Train },
  { value: "cycling", label: "Cycling", icon: Bike },
  { value: "walking", label: "Walking", icon: Footprints },
  { value: "none", label: "None", icon: Accessibility },
];

export function OnboardingView() {
  const { user, setUser, setView } = useEcoStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // form state
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [occupation, setOccupation] = useState(user?.occupation ?? "");
  const [diet, setDiet] = useState<DietPref>(
    (user?.diet as DietPref) ?? "veg"
  );
  const [vehicle, setVehicle] = useState<VehicleType>(
    (user?.vehicle as VehicleType) ?? "bus"
  );

  async function finish() {
    setSaving(true);
    try {
      const { user: updated } = await api.updateProfile({
        name: user?.name,
        age: age ? Number(age) : null,
        country: country || null,
        city: city || null,
        occupation: occupation || null,
        diet,
        vehicle,
        onboarded: true,
      });
      setUser(updated);
      // seed today's log as a friendly empty baseline? No — let them log themselves.
      toast.success("Welcome aboard! Your dashboard is ready. 🌍");
      setView("dashboard");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const canNext =
    step === 0
      ? true
      : step === 1
        ? !!diet
        : step === 2
          ? !!vehicle
          : true;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/40 to-background">
      <header className="border-b border-emerald-100 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Brand />
          <div className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8 sm:px-6">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-emerald-600 text-white"
                    : i === step
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    i < step ? "bg-emerald-600" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-emerald-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="text-emerald-600" size={20} />
                {STEPS[step]}
              </CardTitle>
              <CardDescription>
                {step === 0 &&
                  "Tell us a bit about yourself so we can personalize your experience."}
                {step === 1 && "What does your typical diet look like?"}
                {step === 2 && "How do you usually commute?"}
                {step === 3 && "Review your details and start tracking."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {step === 0 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="24"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min={10}
                        max={120}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        placeholder="Student / Professional"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="India"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {DIET_OPTIONS.map((d) => {
                    const active = diet === d.value;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDiet(d.value)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
                          active
                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                            : "border-border hover:border-emerald-300 hover:bg-emerald-50/40"
                        }`}
                      >
                        <span className="text-3xl">{d.emoji}</span>
                        <span className="font-semibold">{d.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {d.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {VEHICLE_OPTIONS.map((v) => {
                    const active = vehicle === v.value;
                    return (
                      <button
                        key={v.value}
                        type="button"
                        onClick={() => setVehicle(v.value)}
                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                          active
                            ? "border-emerald-500 bg-emerald-50 shadow-sm"
                            : "border-border hover:border-emerald-300 hover:bg-emerald-50/40"
                        }`}
                      >
                        <v.icon
                          className={active ? "text-emerald-600" : "text-muted-foreground"}
                          size={24}
                        />
                        <span className="text-sm font-medium">{v.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-emerald-50/60 p-4">
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <Row label="Name" value={user?.name} />
                      <Row label="Age" value={age || "—"} />
                      <Row label="Occupation" value={occupation || "—"} />
                      <Row label="City" value={city || "—"} />
                      <Row label="Country" value={country || "—"} />
                      <Row label="Diet" value={diet} />
                      <Row label="Vehicle" value={vehicle} />
                      <Row label="Start date" value={todayStr()} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can edit these anytime from your Profile. We&apos;ll use
                    them to personalize your carbon calculations and AI tips.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0 || saving}
                >
                  <ArrowLeft size={16} className="mr-1" /> Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canNext}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Next <ArrowRight size={16} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={finish}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving && <Loader2 className="mr-2 animate-spin" size={16} />}
                    Start tracking <ArrowRight size={16} className="ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value || "—"}</span>
    </div>
  );
}
