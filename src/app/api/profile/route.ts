import { NextResponse } from "next/server";
import { createOrUpdateUser, getUserById } from "@/lib/firestore";
import { getAuthUser, toPublicUser } from "@/lib/server-auth";
import { touchDailyLogin } from "@/lib/daily-login";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updated = await touchDailyLogin(user.id, user.lastActiveDate ?? null);
    if (!updated) {
      return NextResponse.json({ user: toPublicUser(user) });
    }
    return NextResponse.json({ user: toPublicUser(updated) });
  } catch (err) {
    console.error("GET /profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const {
      name,
      age,
      country,
      city,
      occupation,
      diet,
      vehicle,
      onboarded,
    } = body as {
      name?: string;
      age?: number | null;
      country?: string;
      city?: string;
      occupation?: string;
      diet?: string;
      vehicle?: string;
      onboarded?: boolean;
    };

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (diet !== undefined) updateData.diet = diet;
    if (vehicle !== undefined) updateData.vehicle = vehicle;
    if (onboarded !== undefined) updateData.onboarded = onboarded;

    const updated = await createOrUpdateUser({ id: user.id, ...updateData });
    return NextResponse.json({ user: toPublicUser(updated) });
  } catch (e) {
    console.error("[profile] error", e);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
