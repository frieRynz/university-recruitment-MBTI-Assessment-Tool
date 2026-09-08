import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { email, password } = parsed.data;

  // 2.1 Login: credential check across Employee AND Candidate tables.
  const employee = await prisma.employee.findUnique({ where: { email } });
  if (employee && bcrypt.compareSync(password, employee.password)) {
    await createSession({
      id: employee.id, email: employee.email, name: employee.name,
      role: employee.role, principalType: "EMPLOYEE",
    });
    return NextResponse.json({ role: employee.role, principalType: "EMPLOYEE", name: employee.name });
  }

  const candidate = await prisma.candidate.findUnique({ where: { email } });
  if (candidate && bcrypt.compareSync(password, candidate.password)) {
    await createSession({
      id: candidate.id, email: candidate.email, name: candidate.name,
      role: "CANDIDATE", principalType: "CANDIDATE",
    });
    return NextResponse.json({ role: "CANDIDATE", principalType: "CANDIDATE", name: candidate.name });
  }

  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
}