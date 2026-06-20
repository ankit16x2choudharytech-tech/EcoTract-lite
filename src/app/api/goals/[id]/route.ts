import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebaseAdmin";
import { getAuthUser } from "@/lib/server-auth";
import { XP_RULES } from "@/lib/carbon";

/** PATCH: increment progress; complete & award XP when target reached. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { action } = body as { action: "increment" | "complete" | "reset" };

    const goalDoc = await firestore
      .collection("users")
      .doc(user.id)
      .collection("goals")
      .doc(id)
      .get();

    if (!goalDoc.exists()) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    const goal = { id: goalDoc.id, ...goalDoc.data() } as any;

    if (action === "reset") {
      await firestore
        .collection("users")
        .doc(user.id)
        .collection("goals")
        .doc(id)
        .update({ progress: 0, completed: false });

      const updated = await firestore
        .collection("users")
        .doc(user.id)
        .collection("goals")
        .doc(id)
        .get();

      return NextResponse.json({ goal: { id: updated.id, ...updated.data() } });
    }

    if (goal.completed && action !== "complete") {
      return NextResponse.json({ goal, alreadyCompleted: true });
    }

    let newProgress = goal.progress;
    if (action === "increment") newProgress = goal.progress + 1;
    if (action === "complete") newProgress = goal.target;

    const nowCompleted = newProgress >= goal.target;
    let updatedUser = user;
    let xpAwarded = 0;

    if (nowCompleted && !goal.completed) {
      xpAwarded = goal.xp + XP_RULES.goalCompleted;
      const newXp = (user.xp || 0) + xpAwarded;
      await firestore.collection("users").doc(user.id).update({ xp: newXp });
      updatedUser = { ...user, xp: newXp };
    }

    await firestore
      .collection("users")
      .doc(user.id)
      .collection("goals")
      .doc(id)
      .update({
        progress: Math.min(newProgress, goal.target),
        completed: nowCompleted,
      });

    const updatedGoalDoc = await firestore
      .collection("users")
      .doc(user.id)
      .collection("goals")
      .doc(id)
      .get();

    return NextResponse.json({
      goal: { id: updatedGoalDoc.id, ...updatedGoalDoc.data() },
      user: updatedUser,
      xpAwarded,
    });
  } catch (e) {
    console.error("[goal patch] error", e);
    return NextResponse.json(
      { error: "Failed to update goal." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.goal.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
