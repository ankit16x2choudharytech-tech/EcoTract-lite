import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { getDailyLogs, addDailyLog, getUserById, createOrUpdateUser } from "@/lib/firestore";
import { getAuthUser, toPublicUser } from "@/lib/server-auth";
import {
  XP_RULES,
  calculateBreakdown,
  BADGE_DEFS,
} from "@/lib/carbon";
import { touchDailyLogin } from "@/lib/daily-login";
import { getAllBadgeDefs, evaluateBadgesFromDefs } from "@/lib/badge-defs";
import type { DailyLogInput } from "@/lib/types";

// Helper function to fetch badges for a user
async function fetch_badges_for_user(userId: string) {
  const snap = await firestore.collection('users').doc(userId).collection('badges').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days") ?? "60");
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  try {
    const logs = await getDailyLogs(user.id) || [];
    const filtered = logs.filter((l: any) => l.date >= sinceStr).sort((a: any, b: any) => a.date.localeCompare(b.date));
    return NextResponse.json({ logs: filtered });
  } catch (e) {
    return NextResponse.json({ logs: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await req.json()) as DailyLogInput;
    const breakdown = calculateBreakdown(body);

    // check if a log already exists for this date
    let allLogs: any[] = [];
    try {
      allLogs = await getDailyLogs(user.id) || [];
    } catch (e) {
      allLogs = [];
    }

    const existing = allLogs.find((l: any) => l.date === body.date);
    const wasNew = !existing;

    const log = existing
      ? { ...existing, ...breakdown, ...body }
      : {
          id: Date.now().toString(),
          userId: user.id,
          date: body.date,
          transportMode: body.transportMode ?? null,
          transportKm: body.transportKm ?? 0,
          acHours: body.acHours ?? 0,
          fanHours: body.fanHours ?? 0,
          lightHours: body.lightHours ?? 0,
          laptopHours: body.laptopHours ?? 0,
          tvHours: body.tvHours ?? 0,
          vegMeals: body.vegMeals ?? 0,
          veganMeals: body.veganMeals ?? 0,
          nonVegMeals: body.nonVegMeals ?? 0,
          plasticBags: body.plasticBags ?? 0,
          glassItems: body.glassItems ?? 0,
          paperItems: body.paperItems ?? 0,
          recycling: body.recycling ?? false,
          composting: body.composting ?? false,
          transportCarbon: breakdown.transport,
          electricityCarbon: breakdown.electricity,
          foodCarbon: breakdown.food,
          wasteCarbon: breakdown.waste,
          totalCarbon: breakdown.total,
        };

    await addDailyLog(user.id, log);

    // Ensure user profile exists in Firestore
    const userRef = firestore.collection("users").doc(user.id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        id: user.id,
        email: user.email || "",
        xp: 0,
        streak: 0,
        createdAt: new Date().toISOString(),
      });
    }

    // 1) Touch daily login FIRST — updates streak, lastActiveDate, awards daily-login XP
    const originalStreak = user.streak || 0;
    let updatedUser = (await touchDailyLogin(user.id, user.lastActiveDate ?? null)) ?? user;
    const streakUpdated = (updatedUser.streak || 0) !== originalStreak;

    // 2) Award activity XP — +20 for new, +5 for update
    const activityXp = wasNew ? XP_RULES.activityAdded : XP_RULES.activityUpdated;
    updatedUser = await createOrUpdateUser({
      ...updatedUser,
      xp: (updatedUser.xp || 0) + activityXp,
    });

    // Evaluate badges — gracefully handle missing badgeDefs collection
    let newBadges: { name: string; description: string }[] = [];
    try {
      const allLogs2 = await getDailyLogs(user.id);
      const totalLoggedDays = allLogs2.length;
      const carbonValues = allLogs2.map((l: any) => l.totalCarbon || 0);
      const bestDayKg = carbonValues.length > 0 ? Math.min(...carbonValues) : null;

      let badgeDefs = await getAllBadgeDefs();

      // If no badgeDefs exist in Firestore, use hardcoded defaults as fallback
      if (badgeDefs.length === 0) {
        badgeDefs = BADGE_DEFS.map((d, i) => ({
          id: `default-${i}`,
          name: d.name,
          description: d.description,
          icon: d.icon,
          criteria: d.name === "Green Starter" ? "loggedDays" :
                   d.name === "Eco Explorer" ? "loggedDays" :
                   d.name === "Carbon Fighter" ? "loggedDays" :
                   d.name === "Planet Protector" ? "streak" : "manual",
          threshold: d.name === "Green Starter" ? 1 :
                     d.name === "Eco Explorer" ? 5 :
                     d.name === "Carbon Fighter" ? 25 :
                     d.name === "Planet Protector" ? 30 : 0,
          isDefault: true,
        }));
      }

      const earnedNames = evaluateBadgesFromDefs(badgeDefs, {
        totalLoggedDays,
        streak: updatedUser.streak || 0,
        xp: updatedUser.xp || 0,
        bestDayKg,
      });

      // Earth Hero special: best day under 5 kg CO₂
      if (bestDayKg !== null && bestDayKg <= 5) {
        earnedNames.push("Earth Hero");
      }

      const existingBadges = await fetch_badges_for_user(user.id);
      const existingNames = new Set(existingBadges.map((b: any) => b.name));
      const newlyEarned = earnedNames.filter((n: string) => !existingNames.has(n));

      for (const name of newlyEarned) {
        const def = badgeDefs.find((d: any) => d.name === name);
        await firestore.collection('users').doc(user.id).collection('badges').add({
          userId: user.id,
          name,
          description: def?.description ?? null,
          badgeDefId: def?.id ?? null,
          earnedAt: new Date().toISOString(),
        });
      }

      newBadges = newlyEarned.map((n: string) => ({
        name: n,
        description: badgeDefs.find((d: any) => d.name === n)?.description ?? "",
      }));
    } catch (badgeErr) {
      // Badge evaluation failed — log but don't fail the entire request
      console.error("Badge evaluation error (non-critical):", badgeErr);
    }

    // Convert user to public user for response
    const publicUser = toPublicUser(updatedUser);

    return NextResponse.json({
      log,
      xpAwarded: activityXp,
      streakUpdated,
      newBadges,
      user: publicUser,
    });
  } catch (err) {
    console.error("POST /logs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
