import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const allGoals: any[] = [];
    const usersSnap = await firestore.collection("users").get();

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data() as any;
      const goalsSnap = await firestore
        .collection("users")
        .doc(userDoc.id)
        .collection("goals")
        .orderBy("createdAt", "desc")
        .get();

      goalsSnap.docs.forEach((doc) => {
        allGoals.push({
          id: doc.id,
          ...doc.data(),
          userName: userData.name,
          userEmail: userData.email,
        });
      });
    }

    // Sort by createdAt and limit to 500
    allGoals.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    allGoals.splice(500);

    // Aggregate stats by type
    const byType = new Map<string, { count: number; completed: number }>();
    for (const g of allGoals) {
      const t = byType.get(g.type) ?? { count: 0, completed: 0 };
      t.count += 1;
      if (g.completed) t.completed += 1;
      byType.set(g.type, t);
    }

    return NextResponse.json({
      goals: allGoals,
      stats: {
        total: allGoals.length,
        completed: allGoals.filter((g) => g.completed).length,
        byType: [...byType.entries()].map(([type, v]) => ({ type, ...v })),
      },
    });
  } catch (err) {
    console.error("Admin GET /goals error:", err);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}
