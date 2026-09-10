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

  // Login: employees only.
  const employee = await prisma.employee.findUnique({ where: { email } });
  if (employee && bcrypt.compareSync(password, employee.password)) {
    await createSession({
      id: employee.id, email: employee.email, name: employee.name,
      role: employee.role,
    });
    return NextResponse.json({ role: employee.role, name: employee.name });
  }

  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
}