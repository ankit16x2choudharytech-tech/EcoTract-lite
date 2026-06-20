import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";

/** POST /api/admin/users/[id]/grant-badge { badgeDefId } — manually grant a badge to a user. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { badgeDefId } = body as { badgeDefId?: string };

    if (!badgeDefId) {
      return NextResponse.json({ error: "badgeDefId is required." }, { status: 400 });
    }

    // Verify badge definition exists
    const defDoc = await firestore.collection("badgeDefs").doc(badgeDefId).get();
    if (!defDoc.exists()) {
      return NextResponse.json({ error: "Badge definition not found." }, { status: 404 });
    }
    const def = { id: defDoc.id, ...defDoc.data() } as any;

    // Verify user exists
    const userDoc = await firestore.collection("users").doc(userId).get();
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if already earned
    const existingSnap = await firestore
      .collection("users")
      .doc(userId)
      .collection("badges")
      .where("name", "==", def.name)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      const existing = { id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() };
      return NextResponse.json({ ok: true, alreadyEarned: true, badge: existing });
    }

    // Grant the badge
    const badgeRef = await firestore
      .collection("users")
      .doc(userId)
      .collection("badges")
      .add({
        name: def.name,
        description: def.description,
        badgeDefId: def.id,
        earnedAt: new Date().toISOString(),
      });

    const badgeDoc = await badgeRef.get();
    const badge = { id: badgeDoc.id, ...badgeDoc.data() };

    return NextResponse.json({ ok: true, badge, badgeDef: def });
  } catch (err) {
    console.error("Admin POST /grant-badge error:", err);
    return NextResponse.json({ error: "Failed to grant badge" }, { status: 500 });
  }
}
