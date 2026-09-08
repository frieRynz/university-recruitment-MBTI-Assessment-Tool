import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth/rbac";
import { scoreMbti } from "@/lib/mbti/scoring";
import { sendNotification } from "@/lib/notifications";

const schema = z.object({
  positionId: z.number().int(),
  E_I: z.array(z.number().min(-3).max(3)).length(3),
  S_N: z.array(z.number().min(-3).max(3)).length(3),
  T_F: z.array(z.number().min(-3).max(3)).length(3),
  J_P: z.array(z.number().min(-3).max(3)).length(3),
});

// 4.2/4.3 Candidate test submission scoped to Candidate + Position pairing.
// Test locking: only allowed while the assignment is PENDING; result stored against the pairing.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { positionId, ...answers } = parsed.data;

  return withAuth(async (session) => {
    if (session.principalType !== "CANDIDATE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Must have a PENDING assignment for this pairing (RBAC + test locking)
    const assignment = await prisma.testAssignment.findUnique({
      where: { candidateId_positionId: { candidateId: session.id, positionId } },
      include: { position: true },
    });
    if (!assignment) {
      return NextResponse.json({ error: "No test assigned for this position" }, { status: 403 });
    }
    if (assignment.status === "COMPLETED") {
      return NextResponse.json({ error: "Test already submitted and locked. Ask HR to reassign to retake." }, { status: 409 });
    }

    const s = scoreMbti(answers);
    const result = await prisma.candidateMBTIResult.create({
      data: {
        candidateId: session.id,
        positionId,
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

    await prisma.testAssignment.update({
      where: { id: assignment.id },
      data: { status: "COMPLETED" },
    });

    // Notify HR (stubbed)
    const hr = await prisma.employee.findFirst({ where: { role: "HR_EXECUTIVE" } });
    if (hr) {
      sendNotification({
        type: "TEST_COMPLETED", to: hr.email,
        candidateName: session.name, positionTitle: assignment.position.title,
      });
    }

    return NextResponse.json({ result, scored: s }, { status: 201 });
  });
}