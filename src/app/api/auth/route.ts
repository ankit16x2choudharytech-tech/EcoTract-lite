import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { createOrUpdateUser, getUserById, getUserByEmail } from "@/lib/firestore";
import { toPublicUser } from "@/lib/server-auth";
import { signJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body as {
      action: "signup" | "login" | "google";
      email?: string;
      password?: string;
      name?: string;
      idToken?: string;
    };

    const email = (body.email as string | undefined)?.trim().toLowerCase();

    // ─── Google login (real Firebase Auth + simulated fallback) ──
    if (action === "google") {
      const name = (body.name as string | undefined)?.trim();
      if (!email || !name) {
        return NextResponse.json(
          { error: "Email and name are required for Google login." },
          { status: 400 }
        );
      }

      try {
        // If a real Firebase ID token was provided, verify it
        let verifiedUid: string | null = null;
        if (body.idToken) {
          try {
            const decoded = await admin.auth().verifyIdToken(body.idToken);
            verifiedUid = decoded.uid;
          } catch (tokenErr) {
            console.warn("Firebase ID token verification failed, using email-based lookup:", tokenErr);
          }
        }

        // Check if user already exists in Firestore
        let existingUser = await getUserByEmail(email);

        if (existingUser) {
          // User exists — update and return
          const updated = await createOrUpdateUser({
            ...existingUser,
            id: existingUser.id,
            googleAuth: true,
          });
          const token = signJwt({ uid: updated.id, email: updated.email });
          return NextResponse.json({ user: toPublicUser(updated), token });
        }

        // New Google user — create in Firebase Auth and Firestore
        let uid: string;

        if (verifiedUid) {
          // Use the verified UID from the Firebase ID token
          uid = verifiedUid;
        } else {
          // Fallback: create user in Firebase Auth (without password)
          try {
            const record = await admin.auth().createUser({
              email,
              displayName: name,
              password: Math.random().toString(36).slice(2) + "Gg1!",
            });
            uid = record.uid;
          } catch (err: any) {
            if (err.code === "auth/email-already-exists") {
              const fbUser = await admin.auth().getUserByEmail(email);
              uid = fbUser.uid;
            } else {
              throw err;
            }
          }
        }

        const newUser = await createOrUpdateUser({
          id: uid,
          email,
          name,
          xp: 0,
          streak: 0,
          onboarded: false,
          isAdmin: false,
          googleAuth: true,
          createdAt: new Date().toISOString(),
        });
        const token = signJwt({ uid: newUser.id, email: newUser.email });
        return NextResponse.json({ user: toPublicUser(newUser), token });
      } catch (err: any) {
        console.error("Google auth error:", err);
        return NextResponse.json({ error: "Google auth failed" }, { status: 500 });
      }
    }

    // ─── Email auth (signup / login) ─────────────────────────────
    const password = body.password as string | undefined;
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // ── SIGNUP ──
    if (action === "signup") {
      const name = (body.name as string | undefined)?.trim();
      if (!name) {
        return NextResponse.json({ error: "Name is required." }, { status: 400 });
      }
      try {
        const record = await admin.auth().createUser({
          email,
          password,
          displayName: name,
        });
        const user = await createOrUpdateUser({
          id: record.uid,
          email,
          name,
          xp: 0,
          streak: 0,
          onboarded: false,
          isAdmin: false,
          googleAuth: false,
          createdAt: new Date().toISOString(),
        });
        const token = signJwt({ uid: user.id, email: user.email });
        return NextResponse.json({ user: toPublicUser(user), token });
      } catch (err: any) {
        if (err.code === "auth/email-already-exists") {
          return NextResponse.json(
            { error: "An account with this email already exists." },
            { status: 409 }
          );
        }
        console.error("Signup error:", err);
        return NextResponse.json({ error: "Signup failed" }, { status: 500 });
      }
    }

    // ── LOGIN ──
    if (action === "login") {
      try {
        const user = await getUserByEmail(email);
        if (!user) {
          return NextResponse.json(
            { error: "Invalid email or password." },
            { status: 401 }
          );
        }

        try {
          await admin.auth().getUser(user.id);
        } catch {
          return NextResponse.json(
            { error: "Invalid email or password." },
            { status: 401 }
          );
        }

        const token = signJwt({ uid: user.id, email: user.email });
        return NextResponse.json({ user: toPublicUser(user), token });
      } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Auth endpoint error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
