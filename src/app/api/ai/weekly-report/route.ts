import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { getAuthUser } from "@/lib/server-auth";
import type { WeeklyReport } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceStr = since.toISOString().slice(0, 10);

    const logsSnap = await firestore
      .collection("users")
      .doc(user.id)
      .collection("dailyLogs")
      .where("date", ">=", sinceStr)
      .orderBy("date", "asc")
      .get();
    const logs = logsSnap.docs.map((d) => d.data()) as any[];

    // previous 7 days for comparison
    const prevSince = new Date();
    prevSince.setDate(prevSince.getDate() - 14);
    const prevSinceStr = prevSince.toISOString().slice(0, 10);

    const prevLogsSnap = await firestore
      .collection("users")
      .doc(user.id)
      .collection("dailyLogs")
      .where("date", ">=", prevSinceStr)
      .where("date", "<", sinceStr)
      .get();
    const prevLogs = prevLogsSnap.docs.map((d) => d.data()) as any[];

    if (logs.length === 0) {
      return NextResponse.json({
        weeklyCarbon: 0,
        topEmissionSource: "No data yet",
        biggestImprovement: "Log your activities to unlock your weekly report.",
        nextWeekGoal: "Try logging at least 5 days this week.",
        summary:
          "Once you start logging daily activities, your AI weekly report will appear here every Sunday with insights, progress, and a goal for the coming week.",
      } satisfies WeeklyReport);
    }

    const totals = logs.reduce(
      (acc, l) => {
        acc.transport += l.transportCarbon || 0;
        acc.electricity += l.electricityCarbon || 0;
        acc.food += l.foodCarbon || 0;
        acc.waste += l.wasteCarbon || 0;
        acc.total += l.totalCarbon || 0;
        return acc;
      },
      { transport: 0, electricity: 0, food: 0, waste: 0, total: 0 }
    );
    const prevTotal = prevLogs.reduce((s, l) => s + (l.totalCarbon || 0), 0);
    const prevAvg = prevLogs.length ? prevTotal / prevLogs.length : 0;
    const currAvg = totals.total / logs.length;

    const cats = [
      { name: "Transport", value: totals.transport },
      { name: "Electricity", value: totals.electricity },
      { name: "Food", value: totals.food },
      { name: "Waste", value: totals.waste },
    ];
    const top = cats.reduce((a, b) => (b.value > a.value ? b : a));

    const improvementPct =
      prevAvg > 0
        ? Math.round(((prevAvg - currAvg) / prevAvg) * 100)
        : 0;

    const context = {
      weeklyCarbon: Math.round(totals.total * 100) / 100,
      daysLogged: logs.length,
      categoryTotals: {
        transport: Math.round(totals.transport * 100) / 100,
        electricity: Math.round(totals.electricity * 100) / 100,
        food: Math.round(totals.food * 100) / 100,
        waste: Math.round(totals.waste * 100) / 100,
      },
      topEmissionSource: top.name,
      previousWeekAvgKg: Math.round(prevAvg * 100) / 100,
      currentWeekAvgKg: Math.round(currAvg * 100) / 100,
      improvementPct,
      streak: user.streak || 0,
      xp: user.xp || 0,
      bestDay: Math.round(Math.min(...logs.map((l) => l.totalCarbon)) * 100) / 100,
    };

    const systemPrompt = `You are EcoTrack AI, the weekly-report writer for the EcoTrack Lite app. Given a user's week of carbon-footprint data, write a concise, motivating weekly report.

Respond with STRICT JSON only:
{
  "weeklyCarbon": <number, copy from input>,
  "topEmissionSource": "<string>",
  "biggestImprovement": "<one sentence, max 20 words, referencing the data>",
  "nextWeekGoal": "<one concrete, measurable goal, max 16 words>",
  "summary": "<2-3 sentence motivating paragraph, max 60 words>"
}

Tone: warm, specific, uplifting. Reference real numbers. Never shame.`;

    let report: WeeklyReport;
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: systemPrompt },
          {
            role: "user",
            content: `My week in EcoTrack:\n${JSON.stringify(
              context,
              null,
              2
            )}\n\nWrite my weekly report.`,
          },
        ],
        thinking: { type: "disabled" },
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      report = parseReport(raw, context);
    } catch (err) {
      console.error("[ai/weekly-report] SDK error", err);
      report = fallbackReport(context);
    }

    return NextResponse.json(report);
  } catch (e) {
    console.error("[ai/weekly-report] error", e);
    return NextResponse.json(
      { error: "Failed to generate weekly report." },
      { status: 500 }
    );
  }
}

function parseReport(
  raw: string,
  ctx: {
    weeklyCarbon: number;
    topEmissionSource: string;
    improvementPct: number;
  }
): WeeklyReport {
  try {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as WeeklyReport;
    return {
      weeklyCarbon: Number(parsed.weeklyCarbon ?? ctx.weeklyCarbon),
      topEmissionSource: String(parsed.topEmissionSource ?? ctx.topEmissionSource),
      biggestImprovement: String(
        parsed.biggestImprovement ??
          `Your ${ctx.topEmissionSource.toLowerCase()} emissions improved this week.`
      ),
      nextWeekGoal: String(
        parsed.nextWeekGoal ??
          "Reduce your top emission source by 10% next week."
      ),
      summary: String(
        parsed.summary ??
          "Great progress this week! Keep building sustainable habits one day at a time."
      ),
    };
  } catch {
    return fallbackReport(ctx);
  }
}

function fallbackReport(ctx: {
  weeklyCarbon: number;
  topEmissionSource: string;
  improvementPct: number;
}): WeeklyReport {
  const dir =
    ctx.improvementPct > 0
      ? `down ${ctx.improvementPct}% vs last week`
      : ctx.improvementPct < 0
        ? `up ${Math.abs(ctx.improvementPct)}% vs last week`
        : "steady vs last week";
  return {
    weeklyCarbon: ctx.weeklyCarbon,
    topEmissionSource: ctx.topEmissionSource,
    biggestImprovement: `Your daily average is ${dir}.`,
    nextWeekGoal: `Cut ${ctx.topEmissionSource.toLowerCase()} emissions by one trip or one hour a day.`,
    summary: `You logged a week of climate action and your footprint is ${ctx.weeklyCarbon} kg CO₂. Your biggest contributor was ${ctx.topEmissionSource.toLowerCase()}. Keep showing up — consistency is how habits stick!`,
  };
}
