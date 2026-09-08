import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth/rbac";
import { sendNotification } from "@/lib/notifications";

const createSchema = z.object({
  candidateId: z.number().int(),
  positionId: z.number().int(),
  status: z.enum(["SHORTLISTED", "INTERVIEWING", "OFFERED", "HIRED", "REJECTED"]),
  notes: z.string().optional(),
});

// 6.5 Record Recruitment Decision — HR Executive + Hiring Manager (use-case table).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { candidateId, positionId, status, notes } = parsed.data;

  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Must reference the candidate's latest completed result for this pairing
    const mbtiResult = await prisma.candidateMBTIResult.findFirst({
      where: { candidateId, positionId },
      orderBy: { timestamp: "desc" },
    });
    if (!mbtiResult) {
      return NextResponse.json({ error: "Candidate has not completed a test for this position" }, { status: 400 });
    }

    const existing = await prisma.recruitmentDecision.findUnique({
      where: { candidateId_positionId: { candidateId, positionId } },
    });

    const decision = existing
      ? await prisma.recruitmentDecision.update({
          where: { id: existing.id },
          data: { status, notes, mbtiResultId: mbtiResult.id, decidedById: session.id, decisionDate: new Date() },
        })
      : await prisma.recruitmentDecision.create({
          data: { candidateId, positionId, mbtiResultId: mbtiResult.id, status, notes, decidedById: session.id },
        });

    // Optionally notify candidate (stubbed)
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    const position = await prisma.position.findUnique({ where: { id: positionId } });
    if (candidate && position) {
      sendNotification({
        type: "DECISION_RECORDED", to: candidate.email,
        candidateName: candidate.name, positionTitle: position.title, status,
      });
    }

    return NextResponse.json({ decision }, { status: existing ? 200 : 201 });
  });
}

// 6.5 Decision log per position — HR/Hiring Manager.
export async function GET(req: NextRequest) {
  const positionId = req.nextUrl.searchParams.get("positionId");
  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const decisions = await prisma.recruitmentDecision.findMany({
      where: positionId ? { positionId: Number(positionId) } : undefined,
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        position: { select: { id: true, title: true } },
        decidedBy: { select: { name: true } },
        mbtiResult: { select: { mbtiResult: true, decisionStyle: true } },
      },
      orderBy: { decisionDate: "desc" },
    });
    return NextResponse.json({ decisions });
  });
}