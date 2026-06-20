import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { getAuthUser } from "@/lib/server-auth";
import type { AIRecommendation, AIInsights } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // gather last 7 days of logs
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

    if (logs.length === 0) {
      return NextResponse.json({
        recommendations: [],
        motivationalMessage:
          "Log your first activity today and I'll generate personalized tips to shrink your footprint!",
      } satisfies AIInsights);
    }

    // aggregate categories
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

    const dailyAvg = totals.total / logs.length;
    const profile = {
      diet: user.diet,
      vehicle: user.vehicle,
      city: user.city,
      occupation: user.occupation,
    };

    const context = {
      daysLogged: logs.length,
      dailyAverageKg: Math.round(dailyAvg * 100) / 100,
      weeklyTotalKg: Math.round(totals.total * 100) / 100,
      categoryTotalsKg: {
        transport: Math.round(totals.transport * 100) / 100,
        electricity: Math.round(totals.electricity * 100) / 100,
        food: Math.round(totals.food * 100) / 100,
        waste: Math.round(totals.waste * 100) / 100,
      },
      profile,
      recentDays: logs.slice(-7).map((l) => ({
        date: l.date,
        transportKm: l.transportKm,
        transportMode: l.transportMode,
        acHours: l.acHours,
        plasticBags: l.plasticBags,
        nonVegMeals: l.nonVegMeals,
        totalKg: l.totalCarbon,
      })),
    };

    const systemPrompt = `You are EcoTrack AI, a friendly and motivating climate coach inside the EcoTrack Lite app. You analyze a user's weekly carbon-footprint data and produce exactly 5 personalized, actionable recommendations to reduce CO₂ emissions.

Respond with STRICT JSON only (no markdown, no prose outside JSON). The JSON shape must be:
{
  "recommendations": [
    {
      "title": "short action title (max 8 words)",
      "detail": "one specific sentence explaining how to do it and why it helps",
      "estimatedSavingKgPerMonth": <number, rounded to 1 decimal>
    }
  ],
  "motivationalMessage": "one warm, encouraging sentence under 20 words"
}

Rules:
- Base each recommendation on the user's actual category totals and recent activity (call out specifics like "your AC ran X hours").
- Rank by biggest realistic monthly CO₂ saving first.
- Be concrete and habit-friendly (no expensive purchases).
- Keep the tone uplifting, never shaming.`;

    let insights: AIInsights;
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: systemPrompt },
          {
            role: "user",
            content: `Here is my weekly EcoTrack data:\n${JSON.stringify(
              context,
              null,
              2
            )}\n\nGenerate my 5 personalized recommendations.`,
          },
        ],
        thinking: { type: "disabled" },
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      insights = parseInsights(raw, context);
    } catch (err) {
      console.error("[ai/recommendations] SDK error", err);
      insights = fallbackInsights(context);
    }

    return NextResponse.json(insights);
  } catch (e) {
    console.error("[ai/recommendations] error", e);
    return NextResponse.json(
      { error: "Failed to generate recommendations." },
      { status: 500 }
    );
  }
}

function parseInsights(
  raw: string,
  ctx: {
    dailyAverageKg: number;
    categoryTotalsKg: {
      transport: number;
      electricity: number;
      food: number;
      waste: number;
    };
  }
): AIInsights {
  try {
    // strip code fences if present
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as AIInsights;
    if (
      parsed.recommendations &&
      Array.isArray(parsed.recommendations) &&
      parsed.recommendations.length > 0
    ) {
      return {
        recommendations: parsed.recommendations
          .slice(0, 5)
          .map((r: AIRecommendation) => ({
            title: String(r.title ?? "Tip"),
            detail: String(r.detail ?? ""),
            estimatedSavingKgPerMonth: Number(r.estimatedSavingKgPerMonth ?? 0),
          })),
        motivationalMessage:
          parsed.motivationalMessage ??
          "Every small step adds up — keep going, planet protector!",
      };
    }
  } catch {
    /* fall through */
  }
  return fallbackInsights(ctx);
}

function fallbackInsights(ctx: {
  dailyAverageKg: number;
  categoryTotalsKg: {
    transport: number;
    electricity: number;
    food: number;
    waste: number;
  };
}): AIInsights {
  const c = ctx.categoryTotalsKg;
  const recs: AIRecommendation[] = [];
  if (c.transport >= c.electricity && c.transport >= c.food) {
    recs.push({
      title: "Swap car trips for metro twice a week",
      detail:
        "Your transport is the largest source this week. Two metro rides instead of driving can cut a big chunk of CO₂.",
      estimatedSavingKgPerMonth: 9.2,
    });
  }
  if (c.electricity > c.food) {
    recs.push({
      title: "Cut AC use by 1 hour a day",
      detail: "Setting your AC timer one hour earlier saves electricity emissions daily.",
      estimatedSavingKgPerMonth: 31.9,
    });
  } else {
    recs.push({
      title: "Try two plant-based meals a week",
      detail: "Replacing non-veg meals with vegetarian options lowers food emissions significantly.",
      estimatedSavingKgPerMonth: 16.0,
    });
  }
  recs.push({
    title: "Carry a reusable bag everywhere",
    detail: "Avoiding plastic bags is one of the easiest daily wins for the planet.",
    estimatedSavingKgPerMonth: 3.0,
  });
  recs.push({
    title: "Switch off lights when leaving a room",
    detail: "Small habits with lighting add up across a month of use.",
    estimatedSavingKgPerMonth: 2.1,
  });
  recs.push({
    title: "Compost food scraps at home",
    detail: "Composting diverts organic waste from landfill and earns you eco credits.",
    estimatedSavingKgPerMonth: 9.0,
  });
  return {
    recommendations: recs.slice(0, 5),
    motivationalMessage:
      "Small daily actions create big climate impact — you're already on the path!",
  };
}
