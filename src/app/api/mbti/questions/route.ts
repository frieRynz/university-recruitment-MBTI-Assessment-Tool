import { NextResponse } from "next/server";
import { QUESTIONS, LIKERT_OPTIONS } from "@/lib/mbti/questions";
import { DECISION_STYLES } from "@/lib/mbti/styles";
import { requireRole } from "@/lib/auth/rbac";

// 4.1 Question bank — any authenticated principal may fetch (all roles can view learning content).
export async function GET() {
  try {
    await requireRole("CANDIDATE", "FACULTY_STAFF", "HR_EXECUTIVE", "HIRING_MANAGER");
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return NextResponse.json({ questions: QUESTIONS, options: LIKERT_OPTIONS, styles: DECISION_STYLES });
}