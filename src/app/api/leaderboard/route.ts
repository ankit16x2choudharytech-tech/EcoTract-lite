import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { getAuthUser } from "@/lib/server-auth";

type SortKey = "xp" | "streak" | "lowest" | "improvement";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const sort = (url.searchParams.get("sort") ?? "xp") as SortKey;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 30);
    const since = sinceDate.toISOString().slice(0, 10);

    // previous 30-day window for "improvement"
    const prevEnd = new Date(sinceDate);
    const prevStart = new Date();
    prevStart.setDate(prevStart.getDate() - 60);
    const prevStartStr = prevStart.toISOString().slice(0, 10);
    const prevEndStr = prevEnd.toISOString().slice(0, 10);

    // Fetch all users
    const usersSnap = await firestore.collection("users").get();
    const users = usersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Enrich each user with their logs data
    const entries = await Promise.all(
      users.map(async (u) => {
        const logsSnap = await firestore
          .collection("users")
          .doc(u.id)
          .collection("dailyLogs")
          .get();

        const allLogs = logsSnap.docs.map((d) => d.data()) as any[];
        const thisMonth = allLogs.filter((l) => l.date >= since);
        const monthlyCarbon = thisMonth.reduce((s, l) => s + l.totalCarbon, 0);

        const prevMonth = allLogs.filter(
          (l) => l.date >= prevStartStr && l.date < prevEndStr
        );
        const prevCarbon = prevMonth.reduce((s, l) => s + l.totalCarbon, 0);

        const currAvg = thisMonth.length ? monthlyCarbon / thisMonth.length : 0;
        const prevAvg = prevMonth.length ? prevCarbon / prevMonth.length : 0;
        const improvement =
          prevAvg > 0 ? Math.round((prevAvg - currAvg) * 10) / 10 : 0;

        return {
          id: u.id,
          name: u.name,
          xp: u.xp || 0,
          streak: u.streak || 0,
          monthlyCarbon: Math.round(monthlyCarbon * 10) / 10,
          improvement,
          isCurrentUser: u.id === user.id,
        };
      })
    );

    let sorted = [...entries];
    switch (sort) {
      case "streak":
        sorted.sort((a, b) => b.streak - a.streak || b.xp - a.xp);
        break;
      case "lowest":
        // lowest emission — but only count users who have logs
        sorted.sort((a, b) => {
          if (a.monthlyCarbon === 0 && b.monthlyCarbon === 0)
            return b.xp - a.xp;
          if (a.monthlyCarbon === 0) return 1;
          if (b.monthlyCarbon === 0) return -1;
          return a.monthlyCarbon - b.monthlyCarbon;
        });
        break;
      case "improvement":
        sorted.sort((a, b) => b.improvement - a.improvement);
        break;
      default:
        sorted.sort((a, b) => b.xp - a.xp);
    }

    const ranked = sorted.map((e, i) => ({ ...e, rank: i + 1 }));
    return NextResponse.json({ leaderboard: ranked });
  } catch (err) {
    console.error("GET /leaderboard error:", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
