import { verifyJwt } from "./jwt";
import { getUserById, createOrUpdateUser } from "./firestore";
import type { PublicUser } from "./types";

export type FirebaseUser = {
  id: string;
  email: string;
  name: string;
  age?: number | null;
  country?: string | null;
  city?: string | null;
  occupation?: string | null;
  diet?: string | null;
  vehicle?: string | null;
  xp: number;
  streak: number;
  lastActiveDate?: string | null | undefined;
  onboarded: boolean;
  isAdmin: boolean;
  googleAuth: boolean;
  createdAt: string;
};

export function toPublicUser(u: FirebaseUser): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    age: u.age ?? undefined,
    country: u.country ?? undefined,
    city: u.city ?? undefined,
    occupation: u.occupation ?? undefined,
    diet: u.diet ?? undefined,
    vehicle: u.vehicle ?? undefined,
    xp: u.xp,
    streak: u.streak,
    lastActiveDate: u.lastActiveDate ?? undefined,
    onboarded: u.onboarded,
    isAdmin: u.isAdmin,
    googleAuth: u.googleAuth,
    createdAt: u.createdAt,
  };
}

/** Get the authenticated user from JWT in Authorization header. */
export async function getAuthUser(req: Request): Promise<FirebaseUser | null> {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const token = auth.replace(/^Bearer\s+/i, "");
  try {
    // Verify our own JWT token
    const payload = verifyJwt(token);
    if (!payload) return null;

    // Fetch user from Firestore
    const user = await getUserById(payload.uid);
    return user as FirebaseUser | null;
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
}

/** Require an admin user; returns the user or a NextResponse (401/403). */
export async function requireAdmin(
  req: Request
): Promise<{ ok: true; user: FirebaseUser } | { ok: false; response: Response }> {
  const user = await getAuthUser(req);
  if (!user) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  if (!user.isAdmin) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: "Admin access required." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
  return { ok: true, user };
}