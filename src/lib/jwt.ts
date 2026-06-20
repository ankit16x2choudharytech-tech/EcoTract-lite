import crypto from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET || "ecotrack-lite-demo-secret-change-in-production";
const JWT_EXPIRY = "7d"; // 7 days

/** Simple HMAC-SHA256 JWT implementation (no external dependency) */
export function signJwt(payload: { uid: string; email: string }): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = btoa(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + 7 * 24 * 60 * 60, // 7 days
    })
  );
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(
  token: string
): { uid: string; email: string; iat: number; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;

    // Verify signature
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    // Constant-time comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(atob(body));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as { uid: string; email: string; iat: number; exp: number };
  } catch {
    return null;
  }
}