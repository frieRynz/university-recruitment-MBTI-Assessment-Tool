import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type PrincipalRole = "CANDIDATE" | "FACULTY_STAFF" | "HR_EXECUTIVE" | "HIRING_MANAGER";

export interface SessionPayload {
  // Employee or Candidate table id
  id: number;
  email: string;
  name: string;
  role: PrincipalRole;
  // "EMPLOYEE" or "CANDIDATE" — which table this principal belongs to
  principalType: "EMPLOYEE" | "CANDIDATE";
}

const COOKIE_NAME = "mbti_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure only when explicitly enabled (HTTPS deployment). Off by default so the
    // prototype works over plain HTTP (docker compose / localhost).
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      id: payload.id as number,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as PrincipalRole,
      principalType: payload.principalType as "EMPLOYEE" | "CANDIDATE",
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;