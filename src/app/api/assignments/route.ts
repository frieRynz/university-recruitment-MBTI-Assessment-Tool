import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth/rbac";
import { sendNotification } from "@/lib/notifications";

const assignSchema = z.object({
  candidateId: z.number().int(),
  positionId: z.number().int(),
  reassign: z.boolean().optional(),
});

// 5.3 Assign (or reassign) test to candidate for a position — HR Executive only.
// Reassignment (reassign=true) resets a COMPLETED assignment to PENDING (test-lock override).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { candidateId, positionId, reassign } = parsed.data;

  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE") {
      return NextResponse.json({ error: "Forbidden: HR Executive only" }, { status: 403 });
    }

    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    const position = await prisma.position.findUnique({ where: { id: positionId } });
    if (!candidate || !position) return NextResponse.json({ error: "Candidate or position not found" }, { status: 404 });

    const existing = await prisma.testAssignment.findUnique({
      where: { candidateId_positionId: { candidateId, positionId } },
    });

    let assignment;
    if (existing && reassign) {
      assignment = await prisma.testAssignment.update({
        where: { id: existing.id },
        data: { status: "PENDING" },
      });
    } else if (existing) {
      return NextResponse.json({ error: "Already assigned. Use reassign=true to reset." }, { status: 409 });
    } else {
      assignment = await prisma.testAssignment.create({
        data: { candidateId, positionId, status: "PENDING", assignedById: session.id },
      });
    }

    sendNotification({
      type: "CANDIDATE_INVITED", to: candidate.email,
      positionTitle: position.title, testUrl: "/candidate",
    });
    return NextResponse.json({ assignment }, { status: 201 });
  });
}

// List assignments per position (for comparison readiness) — HR/Hiring Manager.
export async function GET(req: NextRequest) {
  const positionId = req.nextUrl.searchParams.get("positionId");
  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const assignments = await prisma.testAssignment.findMany({
      where: positionId ? { positionId: Number(positionId) } : undefined,
      include: {
        candidate: { select: { id: true, name: true, email: true, source: true } },
        position: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ assignments });
  });
}