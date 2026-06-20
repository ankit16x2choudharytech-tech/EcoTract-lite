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
    const defDoc = await firestore.collection("badgeDefs").doc(id).get();

    if (!defDoc.exists()) {
      return NextResponse.json(
        { error: "Badge definition not found." },
        { status: 404 }
      );
    }

    const def = defDoc.data() as any;
    if (def.isDefault) {
      return NextResponse.json(
        { error: "Default badges cannot be deleted." },
        { status: 400 }
      );
    }

    // Delete the badge definition
    await firestore.collection("badgeDefs").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin DELETE /badge-defs/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete badge definition" },
      { status: 500 }
    );
  }
}
