import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, requireRole } from "@/lib/auth/rbac";

// HR: full employee profile + all of their MBTI test results (full analysis per attempt).
// RBAC: HR only.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    await requireRole("HR");

    const { id } = await params;
    if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid employee id" }, { status: 400 });

    const employee = await prisma.employee.findUnique({
      where: { id: Number(id) },
      select: {
        id: true, name: true, email: true, dept: true, role: true,
        gender: true, dob: true, createdAt: true,
        mbtiResults: { orderBy: { timestamp: "desc" } },
      },
    });
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    return NextResponse.json({ employee });
  });
}
