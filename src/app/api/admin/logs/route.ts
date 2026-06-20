import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";
import { daysAgoStr } from "@/lib/carbon";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") ?? "30");
    const userId = url.searchParams.get("userId") ?? undefined;
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 500);

    const since = daysAgoStr(days);
    const allLogs: any[] = [];

    if (userId) {
      // Fetch logs for specific user
      const logsSnap = await firestore
        .collection("users")
        .doc(userId)
        .collection("dailyLogs")
        .where("date", ">=", since)
        .orderBy("date", "desc")
        .limit(limit)
        .get();

      const userDoc = await firestore.collection("users").doc(userId).get();
      const userData = userDoc.data() as any;

      logsSnap.docs.forEach((doc) => {
        allLogs.push({
          id: doc.id,
          ...doc.data(),
          userId: doc.data().userId,
          userName: userData?.name,
          userEmail: userData?.email,
        });
      });
    } else {
      // Fetch logs from all users
      const usersSnap = await firestore.collection("users").get();
      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data() as any;
        const logsSnap = await firestore
          .collection("users")
          .doc(userDoc.id)
          .collection("dailyLogs")
          .where("date", ">=", since)
          .get();

        logsSnap.docs.forEach((doc) => {
          allLogs.push({
            id: doc.id,
            ...doc.data(),
            userId: userDoc.id,
            userName: userData.name,
            userEmail: userData.email,
          });
        });
      }

      // Sort by date descending and limit
      allLogs.sort((a, b) => b.date.localeCompare(a.date));
      allLogs.splice(limit);
    }

    return NextResponse.json({ logs: allLogs, count: allLogs.length });
  } catch (err) {
    console.error("Admin GET /logs error:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
