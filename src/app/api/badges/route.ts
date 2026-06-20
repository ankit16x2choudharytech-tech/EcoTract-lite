import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { getAuthUser } from "@/lib/server-auth";
import { getAllBadgeDefs } from "@/lib/badge-defs";
import { BADGE_DEFS } from "@/lib/carbon";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user's badges
    let userBadges: any[] = [];
    try {
      const badgesSnap = await firestore
        .collection("users")
        .doc(user.id)
        .collection("badges")
        .orderBy("earnedAt", "desc")
        .get();
      userBadges = badgesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // badges subcollection may not exist yet
      console.warn("Could not fetch user badges:", e);
    }

    // Fetch all badge definitions — with fallback to hardcoded defaults
    let defs: any[] = [];
    try {
      defs = await getAllBadgeDefs();
    } catch (e) {
      console.warn("Could not fetch badgeDefs from Firestore, using defaults:", e);
    }

    // If no badgeDefs exist in Firestore, use hardcoded defaults
    if (defs.length === 0) {
      defs = BADGE_DEFS.map((d, i) => ({
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

    // Merge: mark which badges are earned
    const all = defs.map((def) => {
      const earned = userBadges.find((b) => b.name === def.name);
      return {
        id: def.id,
        name: def.name,
        description: def.description ?? "",
        icon: def.icon,
        criteria: def.criteria,
        threshold: def.threshold,
        isDefault: def.isDefault,
        earned: !!earned,
        earnedAt: earned?.earnedAt ?? null,
      };
    });

    return NextResponse.json({ badges: all });
  } catch (err) {
    console.error("GET /badges error:", err);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}
