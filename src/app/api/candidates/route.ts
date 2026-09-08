import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth/rbac";
import { sendNotification } from "@/lib/notifications";

const createSchema = z.object({
  name: z.string().min(1),
  dob: z.string(),
  gender: z.enum(["M", "F", "OTHER"]),
  email: z.string().email(),
  linkedEmployeeId: z.number().int().nullable().optional(),
  password: z.string().min(8),
});

// 5.2 Candidate profile list — HR/Hiring Manager.
export async function GET() {
  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const candidates = await prisma.candidate.findMany({
      include: { linkedEmployee: { select: { name: true, dept: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ candidates });
  });
}

// 5.2 Create candidate (external or internal-linked) — HR Executive only. Sends invite (stubbed).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const data = parsed.data;

  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: HR Executive only" }, { status: 403 });
    }
    const existing = await prisma.candidate.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

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
    sendNotification({ type: "CANDIDATE_INVITED", to: candidate.email, positionTitle: "(profile created)", testUrl: "/login" });
    return NextResponse.json({ candidate }, { status: 201 });
  });
}