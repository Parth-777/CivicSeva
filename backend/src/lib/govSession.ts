import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_DURATION_MS = 10 * 60 * 60 * 1000; // 10 hours
const COOKIE_NAME = "civicseva_gov_session";

// In-memory session store -- no database needed. Sessions reset if the
// server restarts, which just means logging in again. That's fine for this.
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

export async function createGovSession(username: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  activeSessions.set(token, { username, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });

  return token;
}

export async function verifyGovSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

export async function destroyGovSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) activeSessions.delete(token);
  cookieStore.delete(COOKIE_NAME);
}