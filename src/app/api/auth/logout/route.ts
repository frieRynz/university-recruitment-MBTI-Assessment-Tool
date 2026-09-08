import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  await destroySession(); // 2.2 Logout / session invalidation
  return NextResponse.json({ ok: true });
}