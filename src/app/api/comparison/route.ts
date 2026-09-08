import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth/rbac";

// 6.3 Candidate Comparison — side-by-side styles + clarity for a Position.
// RBAC: HR Executive + Hiring Manager only.
export async function GET(req: NextRequest) {
  const positionId = req.nextUrl.searchParams.get("positionId");
  if (!positionId) return NextResponse.json({ error: "positionId required" }, { status: 400 });

  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const position = await prisma.position.findUnique({ where: { id: Number(positionId) } });
    if (!position) return NextResponse.json({ error: "Position not found" }, { status: 404 });

    const results = await prisma.candidateMBTIResult.findMany({
      where: { positionId: Number(positionId) },
      include: { candidate: { select: { id: true, name: true, email: true, source: true } } },
      orderBy: { timestamp: "asc" },
    });
    const decisions = await prisma.recruitmentDecision.findMany({
      where: { positionId: Number(positionId) },
    });

    return NextResponse.json({
      position,
      candidates: results.map((r) => ({
        resultId: r.id,
        candidate: r.candidate,
        mbtiResult: r.mbtiResult,
        decisionStyle: r.decisionStyle,
        timestamp: r.timestamp,
        clarity: {
          social: r.socialClarity, vision: r.visionClarity,
          decision: r.decisionClarity, lifestyle: r.lifestyleClarity,
        },
        letters: {
          social: r.socialRatingScore, vision: r.visionRatingScore,
          decision: r.decisionRatingScore, lifestyle: r.lifestyleRatingScore,
        },
        decisionStatus: decisions.find((d) => d.candidateId === r.candidateId)?.status ?? null,
      })),
    });
  });
}