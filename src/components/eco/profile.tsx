"use client";

import { useState } from "react";
import {
  User as UserIcon,
  Save,
  Loader2,
  MapPin,
  Briefcase,
  Cake,
  Leaf,
  Bike,
  Mail,
  Calendar,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { useEcoStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { DietPref, VehicleType } from "@/lib/types";
import { toast } from "sonner";
import { PageHeader } from "./app-shell";

export function ProfileView() {
  const { user, setUser } = useEcoStore();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [occupation, setOccupation] = useState(user?.occupation ?? "");
  const [diet, setDiet] = useState<DietPref>((user?.diet as DietPref) ?? "veg");
  const [vehicle, setVehicle] = useState<VehicleType>(
    (user?.vehicle as VehicleType) ?? "bus"
  );

  async function handleSave() {
    setSaving(true);
    try {
      const { user: updated } = await api.updateProfile({
        name,
        age: age ? Number(age) : null,
        country: country || null,
        city: city || null,
        occupation: occupation || null,
        diet,
        vehicle,
      });
      setUser(updated);
      toast.success("Profile updated! 🌱");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your personal info and lifestyle preferences."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile summary */}
        <Card className="border-emerald-100 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Your eco profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <Avatar className="h-24 w-24 border-4 border-emerald-200">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-700 text-2xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <UiBadge className="bg-amber-100 text-amber-700">
                <Calendar size={12} className="mr-1" />
                Joined{" "}
                {user
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </UiBadge>
              <UiBadge className="bg-orange-100 text-orange-700">
                🔥 {user?.streak ?? 0} day streak
              </UiBadge>
              <UiBadge className="bg-emerald-100 text-emerald-700">
                ⚡ {user?.xp ?? 0} XP
              </UiBadge>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="border-emerald-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="text-emerald-600" size={18} />
              Edit details
            </CardTitle>
            <CardDescription>
              These power your carbon calculations and AI recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={UserIcon} label="Full name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </Field>
              <Field icon={Mail} label="Email">
                <Input value={user?.email ?? ""} disabled className="bg-muted/40" />
              </Field>
              <Field icon={Cake} label="Age">
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="24"
                  min={10}
                  max={120}
                />
              </Field>
              <Field icon={Briefcase} label="Occupation">
                <Input
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Student / Professional"
                />
              </Field>
              <Field icon={MapPin} label="City">
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                />
              </Field>
              <Field icon={MapPin} label="Country">
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={Leaf} label="Diet preference">
                <Select value={diet} onValueChange={(v) => setDiet(v as DietPref)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">🥗 Vegetarian</SelectItem>
                    <SelectItem value="vegan">🌱 Vegan</SelectItem>
                    <SelectItem value="nonveg">🍗 Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field icon={Bike} label="Primary vehicle">
                <Select
                  value={vehicle}
                  onValueChange={(v) => setVehicle(v as VehicleType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">🚗 Car</SelectItem>
                    <SelectItem value="bike">🏍️ Bike</SelectItem>
                    <SelectItem value="bus">🚌 Bus</SelectItem>
                    <SelectItem value="metro">🚇 Metro</SelectItem>
                    <SelectItem value="train">🚆 Train</SelectItem>
                    <SelectItem value="cycling">🚲 Cycling</SelectItem>
                    <SelectItem value="walking">🚶 Walking</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <Loader2 className="mr-2 animate-spin" size={16} />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs">
        <Icon size={13} className="text-muted-foreground" /> {label}
      </Label>
      {children}
    </div>
  );
}
