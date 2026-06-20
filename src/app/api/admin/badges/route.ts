import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const allBadges: any[] = [];
    const usersSnap = await firestore.collection("users").get();

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data() as any;
      const badgesSnap = await firestore
        .collection("users")
        .doc(userDoc.id)
        .collection("badges")
        .orderBy("earnedAt", "desc")
        .get();

      badgesSnap.docs.forEach((doc) => {
        allBadges.push({
          id: doc.id,
          ...doc.data(),
          userName: userData.name,
          userEmail: userData.email,
        });
      });
    }

    // Sort by earnedAt and limit to 500
    allBadges.sort(
      (a, b) =>
        new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    );
    allBadges.splice(500);

    // Count by badge name
    const byName = new Map<string, number>();
    for (const b of allBadges) {
      byName.set(b.name, (byName.get(b.name) ?? 0) + 1);
    }

    return NextResponse.json({
      badges: allBadges,
      stats: {
        total: allBadges.length,
        byName: [...byName.entries()].map(([name, count]) => ({ name, count })),
      },
    });
  } catch (err) {
    console.error("Admin GET /badges error:", err);
    return NextResponse.json({ error: "Failed to fetch badges" }, { status: 500 });
  }
}
