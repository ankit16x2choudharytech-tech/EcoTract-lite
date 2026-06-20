import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    
    // Find the log by searching all users' dailyLogs subcollections
    const usersSnap = await firestore.collection("users").get();
    let found = false;

    for (const userDoc of usersSnap.docs) {
      const logDoc = await firestore
        .collection("users")
        .doc(userDoc.id)
        .collection("dailyLogs")
        .doc(id)
        .get();

      if (logDoc.exists()) {
        await logDoc.ref.delete();
        found = true;
        break;
      }
    }

    if (!found) {
      return NextResponse.json({ error: "Log not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin DELETE /logs/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
