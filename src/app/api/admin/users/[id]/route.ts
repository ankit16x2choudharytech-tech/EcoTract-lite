import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const userDoc = await firestore.collection("users").doc(id).get();
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    const user = { id: userDoc.id, ...userDoc.data() } as any;

    // Fetch last 30 logs
    const logsSnap = await firestore
      .collection("users")
      .doc(id)
      .collection("dailyLogs")
      .orderBy("date", "desc")
      .limit(30)
      .get();
    const logs = logsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Fetch goals
    const goalsSnap = await firestore
      .collection("users")
      .doc(id)
      .collection("goals")
      .orderBy("createdAt", "desc")
      .get();
    const goals = goalsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Fetch badges
    const badgesSnap = await firestore
      .collection("users")
      .doc(id)
      .collection("badges")
      .orderBy("earnedAt", "desc")
      .get();
    const badges = badgesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ user, logs, goals, badges });
  } catch (err) {
    console.error("Admin GET /users/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, value } = body as {
      action:
        | "grantXp"
        | "resetStreak"
        | "setStreak"
        | "toggleAdmin"
        | "toggleOnboarded"
        | "deletePassword";
      value?: number | boolean;
    };

    const targetDoc = await firestore.collection("users").doc(id).get();
    if (!targetDoc.exists()) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    const target = { id: targetDoc.id, ...targetDoc.data() } as any;

    // Prevent admin from removing their own admin status
    if (action === "toggleAdmin" && target.isAdmin && target.id === guard.user.id) {
      return NextResponse.json(
        { error: "You cannot revoke your own admin privileges." },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };

    switch (action) {
      case "grantXp":
        updateData.xp = (target.xp || 0) + (Number(value) || 0);
        break;
      case "resetStreak":
        updateData.streak = 0;
        break;
      case "setStreak":
        updateData.streak = Number(value) || 0;
        break;
      case "toggleAdmin":
        updateData.isAdmin = !target.isAdmin;
        break;
      case "toggleOnboarded":
        updateData.onboarded = !target.onboarded;
        break;
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    await firestore.collection("users").doc(id).update(updateData);
    const updatedDoc = await firestore.collection("users").doc(id).get();
    const updated = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("Admin PATCH /users/[id] error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    if (id === guard.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account." },
        { status: 400 }
      );
    }

    const targetDoc = await firestore.collection("users").doc(id).get();
    if (!targetDoc.exists()) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Delete all subcollections
    const logsSnap = await firestore
      .collection("users")
      .doc(id)
      .collection("dailyLogs")
      .get();
    for (const doc of logsSnap.docs) {
      await doc.ref.delete();
    }

    const goalsSnap = await firestore
      .collection("users")
      .doc(id)
      .collection("goals")
      .get();
    for (const doc of goalsSnap.docs) {
      await doc.ref.delete();
    }

    const badgesSnap = await firestore
      .collection("users")
      .doc(id)
      .collection("badges")
      .get();
    for (const doc of badgesSnap.docs) {
      await doc.ref.delete();
    }

    // Delete user document
    await firestore.collection("users").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin DELETE /users/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
