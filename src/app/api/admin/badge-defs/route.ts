import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";
import { getAllBadgeDefs, toBadgeDefDTO } from "@/lib/badge-defs";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const defs = await getAllBadgeDefs();

    // Count awards per badge definition
    const countMap = new Map<string, number>();
    const usersSnap = await firestore.collection("users").get();

    for (const userDoc of usersSnap.docs) {
      const badgesSnap = await firestore
        .collection("users")
        .doc(userDoc.id)
        .collection("badges")
        .get();

      badgesSnap.docs.forEach((doc) => {
        const badge = doc.data() as any;
        if (badge.badgeDefId) {
          countMap.set(
            badge.badgeDefId,
            (countMap.get(badge.badgeDefId) ?? 0) + 1
          );
        }
      });
    }

    const result = defs.map((d) => ({
      ...d,
      awardedCount: countMap.get(d.id) ?? 0,
    }));

    return NextResponse.json({ badgeDefs: result });
  } catch (err) {
    console.error("Admin GET /badge-defs error:", err);
    return NextResponse.json({ error: "Failed to fetch badge definitions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const { name, description, icon, criteria, threshold } = body as {
      name: string;
      description?: string;
      icon?: string;
      criteria?: string;
      threshold?: number;
    };

    const trimmedName = name?.trim();
    if (!trimmedName) {
      return NextResponse.json(
        { error: "Badge name is required." },
        { status: 400 }
      );
    }

    const validCriteria = ["manual", "loggedDays", "streak", "totalXp"];
    const crit = validCriteria.includes(criteria ?? "") ? criteria! : "manual";

    // Check if badge with this name already exists
    const existingSnap = await firestore
      .collection("badgeDefs")
      .where("name", "==", trimmedName)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json(
        { error: "A badge with this name already exists." },
        { status: 409 }
      );
    }

    const badgeData = {
      name: trimmedName,
      description: description?.trim() || null,
      icon: icon || "Award",
      criteria: crit,
      threshold: Number(threshold) || 0,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    const ref = await firestore.collection("badgeDefs").add(badgeData);
    const doc = await ref.get();
    const created = { id: doc.id, ...doc.data() };

    return NextResponse.json({ badgeDef: toBadgeDefDTO(created) });
  } catch (e) {
    console.error("[admin/badge-defs POST] error", e);
    return NextResponse.json(
      { error: "Failed to create badge." },
      { status: 500 }
    );
  }
}
