import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, requireRole } from "@/lib/auth/rbac";

// HR dashboard: all employee MBTI results as rows, filterable by MBTI type and Employee ID.
// RBAC: HR only.
export async function GET(req: NextRequest) {
  return withAuth(async () => {
    await requireRole("HR");

    const mbti = req.nextUrl.searchParams.get("mbti")?.trim().toUpperCase() ?? "";
    const employeeIdRaw = req.nextUrl.searchParams.get("employeeId")?.trim() ?? "";
    const employeeId = /^\d+$/.test(employeeIdRaw) ? Number(employeeIdRaw) : undefined;

    const results = await prisma.employeeMBTIResult.findMany({
      where: {
        ...(mbti ? { mbtiResult: { contains: mbti } } : {}),
        ...(employeeId !== undefined ? { employeeId } : {}),
      },
      include: { employee: { select: { id: true, name: true, email: true, dept: true } } },
      orderBy: { timestamp: "desc" },
    });
    return NextResponse.json({ results });
  });
}
