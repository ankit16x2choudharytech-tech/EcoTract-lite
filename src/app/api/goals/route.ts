import { NextResponse } from "next/server";
import { getGoals, addGoal } from "@/lib/firestore";
import { getAuthUser } from "@/lib/server-auth";
import { XP_RULES, GOAL_TEMPLATES } from "@/lib/carbon";
import { firestore } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const goals = await getGoals(user.id);
  return NextResponse.json({ goals, templates: GOAL_TEMPLATES });
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { title, description, type, target, xp } = body as {
      title: string;
      description?: string;
      type: string;
      target: number;
      xp?: number;
    };
    if (!title || !type || !target) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }
    const goal = await addGoal(user.id, {
      title,
      description: description ?? null,
      type,
      target: Number(target),
      progress: 0,
      completed: false,
      xp: Number(xp ?? 50),
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ goal });
  } catch (e) {
    console.error("[goals] error", e);
    return NextResponse.json(
      { error: "Failed to create goal." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await firestore.collection('users').doc(user.id).collection('goals').doc(id).delete();
  return NextResponse.json({ ok: true });
}
