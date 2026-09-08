import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { scoreMbti } from "../src/lib/mbti/scoring";
import type { Dichotomy } from "../src/lib/mbti/questions";

const prisma = new PrismaClient();

// helper: score from 12 answers and produce a DB-ready result payload
function resultPayload(answers: Record<Dichotomy, number[]>) {
  const s = scoreMbti(answers);
  return {
    socialRatingScore: s.letters.socialRatingScore as "E" | "I",
    visionRatingScore: s.letters.visionRatingScore as "S" | "N",
    decisionRatingScore: s.letters.decisionRatingScore as "T" | "F",
    lifestyleRatingScore: s.letters.lifestyleRatingScore as "P" | "J",
    mbtiResult: s.mbti_type,
    decisionStyle: s.decision_style,
    socialClarity: s.clarity_scores.E_I,
    visionClarity: s.clarity_scores.S_N,
    decisionClarity: s.clarity_scores.T_F,
    lifestyleClarity: s.clarity_scores.J_P,
  };
}

async function main() {
  const pw = (p: string) => bcrypt.hashSync(p, 10);

  // ---------- Employees: one per role ----------
  const hr = await prisma.employee.upsert({
    where: { email: "hr.exec@university.edu" },
    update: {},
    create: {
      name: "Helen Reyes", dob: new Date("1980-04-12"), gender: "F",
      email: "hr.exec@university.edu", dept: "Human Resources",
      role: "HR_EXECUTIVE", password: pw("Password123!"),
    },
  });

  const manager = await prisma.employee.upsert({
    where: { email: "manager.ict@university.edu" },
    update: {},
    create: {
      name: "Marcus Tan", dob: new Date("1975-09-30"), gender: "M",
      email: "manager.ict@university.edu", dept: "Faculty of ICT",
      role: "HIRING_MANAGER", password: pw("Password123!"),
    },
  });

  const staff = await prisma.employee.upsert({
    where: { email: "staff.sci@university.edu" },
    update: {},
    create: {
      name: "Aisha Karim", dob: new Date("1988-01-22"), gender: "F",
      email: "staff.sci@university.edu", dept: "Faculty of Science",
      role: "FACULTY_STAFF", password: pw("Password123!"),
    },
  });

  // ---------- Positions: 2 open ----------
  const deanIct = await prisma.position.upsert({
    where: { id: 1 }, update: {},
    create: {
      title: "Dean, Faculty of ICT", department: "Faculty of ICT",
      level: "DEAN", status: "OPEN", postedById: hr.id,
    },
  });

  const headBusiness = await prisma.position.upsert({
    where: { id: 2 }, update: {},
    create: {
      title: "Department Head, Business Analytics", department: "Business School",
      level: "DEPARTMENT_HEAD", status: "OPEN", postedById: hr.id,
    },
  });

  // ---------- Candidates: 4 (one internal linked to staff) ----------
  const c1 = await prisma.candidate.upsert({
    where: { email: "david.ong@example.com" }, update: {},
    create: {
      name: "David Ong", dob: new Date("1972-06-15"), gender: "M",
      email: "david.ong@example.com", source: "EXTERNAL", password: pw("Password123!"),
    },
  });

  const c2 = await prisma.candidate.upsert({
    where: { email: "priya.nair@example.com" }, update: {},
    create: {
      name: "Priya Nair", dob: new Date("1978-11-02"), gender: "F",
      email: "priya.nair@example.com", source: "EXTERNAL", password: pw("Password123!"),
    },
  });

  const c3 = await prisma.candidate.upsert({
    where: { email: "li.wei@example.com" }, update: {},
    create: {
      name: "Li Wei", dob: new Date("1976-03-18"), gender: "M",
      email: "li.wei@example.com", source: "INTERNAL",
      linkedEmployeeId: staff.id, password: pw("Password123!"),
    },
  });

  const c4 = await prisma.candidate.upsert({
    where: { email: "sara.lim@example.com" }, update: {},
    create: {
      name: "Sara Lim", dob: new Date("1981-07-25"), gender: "F",
      email: "sara.lim@example.com", source: "EXTERNAL", password: pw("Password123!"),
    },
  });

  // ---------- CandidateMBTIResults (completed tests) ----------
  async function ensureResult(candidateId: number, positionId: number, answers: Record<Dichotomy, number[]>) {
    const existing = await prisma.candidateMBTIResult.findFirst({ where: { candidateId, positionId } });
    if (existing) return existing;
    return prisma.candidateMBTIResult.create({
      data: { candidateId, positionId, ...resultPayload(answers) },
    });
  }

  const r1 = await ensureResult(c1.id, deanIct.id, { E_I: [3, 2, 2], S_N: [1, 2, 1], T_F: [0, 1, 0], J_P: [-3, -2, -2] }); // ESTP
  const r2 = await ensureResult(c2.id, deanIct.id, { E_I: [2, 3, 1], S_N: [3, 2, 2], T_F: [2, 1, 2], J_P: [2, 3, 1] }); // ENTJ
  const r3 = await ensureResult(c3.id, deanIct.id, { E_I: [-2, -3, -1], S_N: [2, 3, 2], T_F: [3, 2, 3], J_P: [1, 0, 2] }); // INTJ
  const r4 = await ensureResult(c4.id, headBusiness.id, { E_I: [1, 2, 0], S_N: [-1, 1, -2], T_F: [-2, -1, -3], J_P: [2, 1, 3] }); // ESFJ

  // ---------- Recruitment decisions ----------
  await prisma.recruitmentDecision.upsert({
    where: { candidateId_positionId: { candidateId: c2.id, positionId: deanIct.id } },
    update: {},
    create: {
      candidateId: c2.id, positionId: deanIct.id, mbtiResultId: r2.id,
      status: "SHORTLISTED", decidedById: hr.id,
      notes: "Strong strategic profile for the Dean role.",
    },
  });

  await prisma.recruitmentDecision.upsert({
    where: { candidateId_positionId: { candidateId: c1.id, positionId: deanIct.id } },
    update: {},
    create: {
      candidateId: c1.id, positionId: deanIct.id, mbtiResultId: r1.id,
      status: "INTERVIEWING", decidedById: manager.id,
      notes: "Dealmaker style — schedule panel interview.",
    },
  });

  // ---------- Employee self-development results (history) ----------
  await prisma.employeeMBTIResult.createMany({
    data: [
      { employeeId: staff.id, ...resultPayload({ E_I: [-1, -2, 0], S_N: [1, 2, 1], T_F: [1, 0, 2], J_P: [2, 1, 3] }) }, // ISTJ
      { employeeId: staff.id, ...resultPayload({ E_I: [1, 0, -1], S_N: [2, 1, 3], T_F: [2, 1, 1], J_P: [1, 2, 0] }) }, // retake
    ],
  });

  console.log("Seed complete:");
  console.log("  Employees: hr.exec@university.edu / manager.ict@university.edu / staff.sci@university.edu (Password123!)");
  console.log("  Candidates: david.ong@ / priya.nair@ / li.wei@ / sara.lim@example.com (Password123!)");
  console.log(`  Positions: ${deanIct.title}, ${headBusiness.title}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
