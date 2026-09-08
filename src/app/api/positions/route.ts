import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";

const createSchema = z.object({
  title: z.string().min(1),
  department: z.string().min(1),
  level: z.enum(["DEPARTMENT_HEAD", "DEAN", "VICE_PROVOST", "PROGRAM_DIRECTOR"]),
});

// 5.1 Position list — HR/Hiring Manager manage; others denied.
export async function GET() {
  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const positions = await prisma.position.findMany({
      include: {
        postedBy: { select: { name: true } },
        _count: { select: { candidateResults: true, assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ positions });
  });
}

// 5.1 Create position — HR Executive only (use-case table: Manage Positions — HR only).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: HR Executive only" }, { status: 403 });
    }
    const position = await prisma.position.create({
      data: { ...parsed.data, status: "OPEN", postedById: session.id },
    });
    return NextResponse.json({ position }, { status: 201 });
  });
}

// 5.1 Update position status (OPEN <-> CLOSED) — HR Executive only.
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const schema = z.object({ id: z.number().int(), status: z.enum(["OPEN", "CLOSED"]) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: HR Executive only" }, { status: 403 });
    }
    const position = await prisma.position.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ position });
  });
}

// Suppress unused import warning for getSession (used implicitly by withAuth chain)
export const dynamic = "force-dynamic";