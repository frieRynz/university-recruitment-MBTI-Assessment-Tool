import { NextResponse } from "next/server";
import { getSession, type PrincipalRole, type SessionPayload } from "./session";

/**
 * RBAC helper — every API route handler must call one of these to enforce
 * the use-case permission table (spec §5) server-side.
 *
 * Permission matrix (principal role -> allowed actions) is encoded here, not in the UI.
 */

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Require an authenticated session. Throws AuthError(401) if none. */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new AuthError(401, "Authentication required");
  return session;
}

/** Require the session's role to be one of `roles`. Throws AuthError(403) otherwise. */
export async function requireRole(...roles: PrincipalRole[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!roles.includes(session.role)) {
    throw new AuthError(403, `Forbidden: requires role ${roles.join(" or ")}`);
  }
  return session;
}

/** Wrap a handler; converts AuthError into proper HTTP responses. */
export async function withAuth(
  fn: (session: SessionPayload) => Promise<Response>
): Promise<Response> {
  try {
    const session = await getSession();
    if (!session) throw new AuthError(401, "Authentication required");
    return await fn(session);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export function unauthorized(res: Response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })) {
  return res;
}