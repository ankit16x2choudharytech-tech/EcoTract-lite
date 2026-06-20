import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/server-auth";
import { todayStr, daysAgoStr } from "@/lib/carbon";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    // Fetch all users
    const usersSnap = await firestore.collection("users").get();
    const allUsers = usersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const totalUsers = allUsers.length;
    const adminCount = allUsers.filter((u) => u.isAdmin).length;
    const onboardedUsers = allUsers.filter((u) => u.onboarded).length;

    // Fetch all logs (from all users' subcollections)
    let totalLogs = 0;
    let totalCo2 = 0;
    const allLogs: any[] = [];
    const categoryAgg = {
      transport: 0,
      electricity: 0,
      food: 0,
      waste: 0,
    };

    for (const user of allUsers) {
      const logsSnap = await firestore
        .collection("users")
        .doc(user.id)
        .collection("dailyLogs")
        .get();

      logsSnap.docs.forEach((doc) => {
        const log = doc.data() as any;
        allLogs.push({ ...log, userId: user.id });
        totalLogs++;
        totalCo2 += log.totalCarbon || 0;
        categoryAgg.transport += log.transportCarbon || 0;
        categoryAgg.electricity += log.electricityCarbon || 0;
        categoryAgg.food += log.foodCarbon || 0;
        categoryAgg.waste += log.wasteCarbon || 0;
      });
    }

    // Fetch all goals
    let totalGoals = 0;
    let completedGoals = 0;
    for (const user of allUsers) {
      const goalsSnap = await firestore
        .collection("users")
        .doc(user.id)
        .collection("goals")
        .get();
      goalsSnap.docs.forEach((doc) => {
        const goal = doc.data() as any;
        totalGoals++;
        if (goal.completed) completedGoals++;
      });
    }

    // Fetch all badges
    let totalBadges = 0;
    for (const user of allUsers) {
      const badgesSnap = await firestore
        .collection("users")
        .doc(user.id)
        .collection("badges")
        .get();
      totalBadges += badgesSnap.size;
    }

    // Calculate engagement metrics
    const weekAgo = daysAgoStr(7);
    const today = todayStr();
    const activeThisWeek = allUsers.filter(
      (u) => u.lastActiveDate && u.lastActiveDate >= weekAgo
    ).length;
    const activeToday = allUsers.filter(
      (u) => u.lastActiveDate === today
    ).length;
    const newThisWeek = allUsers.filter(
      (u) => new Date(u.createdAt) >= new Date(Date.now() - 7 * 86400000)
    ).length;

    // Calculate 14-day trend
    const trend: { date: string; co2: number; logs: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = daysAgoStr(i);
      const dayLogs = allLogs.filter((l) => l.date === d);
      trend.push({
        date: d,
        co2: Math.round(dayLogs.reduce((s, l) => s + l.totalCarbon, 0) * 100) / 100,
        logs: dayLogs.length,
      });
    }

    // Calculate top emitters (last 30 days)
    const monthAgo = daysAgoStr(30);
    const userCo2 = new Map<string, number>();
    for (const l of allLogs) {
      if (l.date >= monthAgo) {
        userCo2.set(l.userId, (userCo2.get(l.userId) ?? 0) + l.totalCarbon);
      }
    }
    const topEmitters = allUsers
      .filter((u) => userCo2.has(u.id))
      .map((u) => ({
        name: u.name,
        email: u.email,
        co2: Math.round((userCo2.get(u.id) ?? 0) * 100) / 100,
      }))
      .sort((a, b) => b.co2 - a.co2)
      .slice(0, 5);

    const avgCo2PerLog = totalLogs > 0 ? totalCo2 / totalLogs : 0;

    return NextResponse.json({
      totals: {
        users: totalUsers,
        admins: adminCount,
        onboarded: onboardedUsers,
        logs: totalLogs,
        goals: totalGoals,
        completedGoals,
        badges: totalBadges,
        totalCo2: Math.round(totalCo2 * 100) / 100,
        avgCo2PerLog: Math.round(avgCo2PerLog * 100) / 100,
      },
      engagement: {
        activeThisWeek,
        activeToday,
        newThisWeek,
      },
      trend,
      categories: {
        transport: Math.round(categoryAgg.transport * 100) / 100,
        electricity: Math.round(categoryAgg.electricity * 100) / 100,
        food: Math.round(categoryAgg.food * 100) / 100,
        waste: Math.round(categoryAgg.waste * 100) / 100,
      },
      topEmitters,
    });
  } catch (err) {
    console.error("Admin GET /stats error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
