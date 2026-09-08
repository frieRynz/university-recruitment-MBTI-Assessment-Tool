import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, withAuth } from "@/lib/auth/rbac";
import { scoreMbti } from "@/lib/mbti/scoring";
import type { Dichotomy } from "@/lib/mbti/questions";

const answerSchema = z.object({
  E_I: z.array(z.number().min(-3).max(3)).length(3),
  S_N: z.array(z.number().min(-3).max(3)).length(3),
  T_F: z.array(z.number().min(-3).max(3)).length(3),
  J_P: z.array(z.number().min(-3).max(3)).length(3),
});

// 4.2 Employee self-development test submission (independent of recruitment).
// RBAC: use-case table — only Candidate/Employee take the test. Employees here = FACULTY_STAFF.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });

  return withAuth(async (session) => {
    await requireRole("FACULTY_STAFF");
    const s = scoreMbti(parsed.data);
    const result = await prisma.employeeMBTIResult.create({
      data: {
        employeeId: session.id,
        socialRatingScore: s.letters.socialRatingScore,
        visionRatingScore: s.letters.visionRatingScore,
        decisionRatingScore: s.letters.decisionRatingScore,
        lifestyleRatingScore: s.letters.lifestyleRatingScore,
        mbtiResult: s.mbti_type,
        decisionStyle: s.decision_style,
        socialClarity: s.clarity_scores.E_I,
        visionClarity: s.clarity_scores.S_N,
        decisionClarity: s.clarity_scores.T_F,
        lifestyleClarity: s.clarity_scores.J_P,
      },
    });
    return NextResponse.json({ result, scored: s }, { status: 201 });
  });
}

// 6.1/6.2 Individual dashboard + historical results (own only)
export async function GET() {
  return withAuth(async (session) => {
    await requireRole("FACULTY_STAFF");
    const results = await prisma.employeeMBTIResult.findMany({
      where: { employeeId: session.id },
      orderBy: { timestamp: "desc" },
    });
    return NextResponse.json({ results });
  });
}