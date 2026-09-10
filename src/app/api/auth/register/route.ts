import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1),
  dob: z.string(),
  gender: z.enum(["M", "F", "OTHER"]),
  email: z.string().email(),
  dept: z.string().min(1),
  role: z.enum(["EMPLOYEE", "HR"]).default("EMPLOYEE"),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.employee.findUnique({ where: { email: data.email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const employee = await prisma.employee.create({
    data: {
      name: data.name, dob: new Date(data.dob), gender: data.gender,
      email: data.email, dept: data.dept, role: data.role,
      password: bcrypt.hashSync(data.password, 10),
    },
  });
  return NextResponse.json({ id: employee.id }, { status: 201 });
}