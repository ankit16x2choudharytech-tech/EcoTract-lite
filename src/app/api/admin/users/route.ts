import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";
import { daysAgoStr } from "@/lib/carbon";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const search = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const role = url.searchParams.get("role") ?? "all"; // all | admin | user

  try {
    // Build query
    let query: any = firestore.collection("users");

    if (role === "admin") {
      query = query.where("isAdmin", "==", true);
    } else if (role === "user") {
      query = query.where("isAdmin", "==", false);
    }

    query = query.orderBy("createdAt", "desc");

    const snap = await query.get();
    let users = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Client-side search filtering (since Firestore doesn't support complex text search)
    if (search) {
      users = users.filter((u) => {
        const searchable = [
          u.name?.toLowerCase() || "",
          u.email?.toLowerCase() || "",
          u.city?.toLowerCase() || "",
        ].join(" ");
        return searchable.includes(search);
      });
    }

    // Attach subcollection counts and 30-day CO2
    const monthAgo = daysAgoStr(30);
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const logsSnap = await firestore
          .collection("users")
          .doc(u.id)
          .collection("dailyLogs")
          .get();
        const goalsSnap = await firestore
          .collection("users")
          .doc(u.id)
          .collection("goals")
          .get();
        const badgesSnap = await firestore
          .collection("users")
          .doc(u.id)
          .collection("badges")
          .get();

        // Calculate 30-day CO2
        let monthlyCo2 = 0;
        logsSnap.docs.forEach((doc) => {
          const log = doc.data() as any;
          if (log.date >= monthAgo) {
            monthlyCo2 += log.totalCarbon || 0;
          }
        });

        return {
          ...u,
          monthlyCo2: Math.round(monthlyCo2 * 100) / 100,
          _count: {
            dailyLogs: logsSnap.size,
            goals: goalsSnap.size,
            badges: badgesSnap.size,
          },
        };
      })
    );

    return NextResponse.json({ users: enrichedUsers });
  } catch (err) {
    console.error("Admin GET /users error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
/*
  const logsAgg = await db.dailyLog.groupBy({
    by: ["userId"],
    where: { userId: { in: userIds }, date: { gte: monthAgo } },
    _sum: { totalCarbon: true },
  });
  const co2Map = new Map<string, number>();
  for (const a of logsAgg) {
    co2Map.set(a.userId, Math.round((a._sum.totalCarbon ?? 0) * 100) / 100);
  }

  const result = users.map((u) => ({
    ...u,
    monthlyCo2: co2Map.get(u.id) ?? 0,
  }));

  return NextResponse.json({ users: result });
}
  */
