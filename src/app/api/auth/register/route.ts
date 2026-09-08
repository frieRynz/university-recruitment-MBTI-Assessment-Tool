import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

const employeeSchema = z.object({
  principalType: z.literal("EMPLOYEE"),
  name: z.string().min(1),
  dob: z.string(),
  gender: z.enum(["M", "F", "OTHER"]),
  email: z.string().email(),
  dept: z.string().min(1),
  role: z.enum(["FACULTY_STAFF", "HR_EXECUTIVE", "HIRING_MANAGER"]).default("FACULTY_STAFF"),
  password: z.string().min(8),
});

const candidateSchema = z.object({
  principalType: z.literal("CANDIDATE"),
  name: z.string().min(1),
  dob: z.string(),
  gender: z.enum(["M", "F", "OTHER"]),
  email: z.string().email(),
  linkedEmployeeId: z.number().int().optional().nullable(),
  password: z.string().min(8),
});

const schema = z.discriminatedUnion("principalType", [employeeSchema, candidateSchema]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.principalType === "EMPLOYEE") {
    const existing = await prisma.employee.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const employee = await prisma.employee.create({
      data: {
        name: data.name, dob: new Date(data.dob), gender: data.gender,
        email: data.email, dept: data.dept, role: data.role,
        password: bcrypt.hashSync(data.password, 10),
      },
    });
    // 1.2 Email verification — stubbed, logged to console
    sendNotification({ type: "VERIFY_EMAIL", to: employee.email, verifyUrl: `/api/auth/verify-email?email=${encodeURIComponent(employee.email)}` });
    return NextResponse.json({ id: employee.id, principalType: "EMPLOYEE" }, { status: 201 });
  }

  const existing = await prisma.candidate.findUnique({ where: { email: data.email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  // 1.3 Internal candidate linking: only link if employee exists and candidate is INTERNAL
  let source: "INTERNAL" | "EXTERNAL" = "EXTERNAL";
  if (data.linkedEmployeeId) {
    const emp = await prisma.employee.findUnique({ where: { id: data.linkedEmployeeId } });
    if (!emp) return NextResponse.json({ error: "linkedEmployeeId does not exist" }, { status: 400 });
    source = "INTERNAL";
  }

  const candidate = await prisma.candidate.create({
    data: {
      name: data.name, dob: new Date(data.dob), gender: data.gender,
      email: data.email, source, linkedEmployeeId: data.linkedEmployeeId ?? null,
      password: bcrypt.hashSync(data.password, 10),
    },
  });
  sendNotification({ type: "VERIFY_EMAIL", to: candidate.email, verifyUrl: `/api/auth/verify-email?email=${encodeURIComponent(candidate.email)}` });
  return NextResponse.json({ id: candidate.id, principalType: "CANDIDATE" }, { status: 201 });
}