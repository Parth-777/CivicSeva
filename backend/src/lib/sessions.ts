import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_DURATION = 30 * 60 * 60 * 1000; // 30 hours

export async function createSession(userId: string) {
  const sessionToken = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const cookieStore = await cookies();

  cookieStore.set("civicseva_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return {
    sessionToken,
    expiresAt,
  };
}