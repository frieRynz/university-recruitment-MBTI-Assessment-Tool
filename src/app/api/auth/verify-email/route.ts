import { NextRequest, NextResponse } from "next/server";

// 1.2 Email verification — prototype stub: marks nothing, logs activation.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  console.log(`[NOTIFICATION] EMAIL_VERIFIED -> ${email ?? "?"} (account activated — stub)`);
  return NextResponse.json({ ok: true, email, message: "Email verification stub — account considered active." });
}