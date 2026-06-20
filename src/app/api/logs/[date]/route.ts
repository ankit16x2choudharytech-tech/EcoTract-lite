import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { getAuthUser } from "@/lib/server-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { date } = await params;

    // Find and delete all logs for this user on this date
    const logsSnap = await firestore
      .collection("users")
      .doc(user.id)
      .collection("dailyLogs")
      .where("date", "==", date)
      .get();

    for (const doc of logsSnap.docs) {
      await doc.ref.delete();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /logs/[date] error:", err);
    return NextResponse.json({ error: "Failed to delete logs" }, { status: 500 });
  }
}
