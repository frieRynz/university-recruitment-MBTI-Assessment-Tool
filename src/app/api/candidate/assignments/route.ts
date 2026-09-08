import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/auth/rbac";

// Flow 2 step 2: candidate's "My Assigned Assessments" — own assignments only.
export async function GET() {
  return withAuth(async (session) => {
    if (session.principalType !== "CANDIDATE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const assignments = await prisma.testAssignment.findMany({
      where: { candidateId: session.id },
      include: {
        position: { select: { id: true, title: true, department: true, level: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    // Attach latest result (if any) so the UI can show "completed" + own result
    const results = await prisma.candidateMBTIResult.findMany({
      where: { candidateId: session.id },
      orderBy: { timestamp: "desc" },
    });
    return NextResponse.json({ assignments, results });
  });
}