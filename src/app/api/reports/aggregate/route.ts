import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth/rbac";

// 6.4 Aggregate/admin report: distribution of decision styles across positions/candidates.
// RBAC: HR Executive + Hiring Manager.
export async function GET() {
  return withAuth(async (session) => {
    if (session.role !== "HR_EXECUTIVE" && session.role !== "HIRING_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const results = await prisma.candidateMBTIResult.findMany({
      select: { mbtiResult: true, decisionStyle: true, positionId: true },
    });

    const byStyle: Record<string, number> = {};
    for (const r of results) {
      byStyle[r.decisionStyle] = (byStyle[r.decisionStyle] ?? 0) + 1;
    }

    const positions = await prisma.position.findMany({
      select: { id: true, title: true, status: true, level: true },
    });

    const byPosition = positions.map((p) => ({
      position: p.title,
      level: p.level,
      status: p.status,
      tested: results.filter((r) => r.positionId === p.id).length,
    }));

    const decisions = await prisma.recruitmentDecision.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    return NextResponse.json({ totalTests: results.length, byStyle, byPosition, decisions });
  });
}