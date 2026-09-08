import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

// 2.3 Password reset — prototype: new password logged/issued via stubbed email.

const schema = z.object({ email: z.string().email(), newPassword: z.string().min(8) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { email, newPassword } = parsed.data;
  const bcrypt = (await import("bcryptjs")).default;

  const employee = await prisma.employee.findUnique({ where: { email } });
  const candidate = employee ? null : await prisma.candidate.findUnique({ where: { email } });
  if (!employee && !candidate) {
    // Do not leak account existence
    return NextResponse.json({ ok: true });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  if (employee) {
    await prisma.employee.update({ where: { id: employee.id }, data: { password: hash } });
  } else if (candidate) {
    await prisma.candidate.update({ where: { id: candidate.id }, data: { password: hash } });
  }
  sendNotification({ type: "PASSWORD_RESET", to: email, resetUrl: "/login" });
  return NextResponse.json({ ok: true });
}