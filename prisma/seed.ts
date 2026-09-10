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

  // ---------- HR account ----------
  const hr = await prisma.employee.upsert({
    where: { email: "hr.exec@university.edu" },
    update: {},
    create: {
      name: "Helen Reyes", dob: new Date("1980-04-12"), gender: "F",
      email: "hr.exec@university.edu", dept: "Human Resources",
      role: "HR", password: pw("Password123!"),
    },
  });

  // ---------- Internal employees ----------
  const staff1 = await prisma.employee.upsert({
    where: { email: "staff.sci@university.edu" },
    update: {},
    create: {
      name: "Aisha Karim", dob: new Date("1988-01-22"), gender: "F",
      email: "staff.sci@university.edu", dept: "Faculty of Science",
      role: "EMPLOYEE", password: pw("Password123!"),
    },
  });

  const staff2 = await prisma.employee.upsert({
    where: { email: "nadia.rahman@university.edu" },
    update: {},
    create: {
      name: "Nadia Rahman", dob: new Date("1990-06-18"), gender: "F",
      email: "nadia.rahman@university.edu", dept: "Faculty of ICT",
      role: "EMPLOYEE", password: pw("Password123!"),
    },
  });

  const staff3 = await prisma.employee.upsert({
    where: { email: "li.wei@university.edu" },
    update: {},
    create: {
      name: "Li Wei", dob: new Date("1976-03-18"), gender: "M",
      email: "li.wei@university.edu", dept: "Business School",
      role: "EMPLOYEE", password: pw("Password123!"),
    },
  });

  // ---------- Employee self-development results (history, 0..many each) ----------
  async function ensureEmployeeResult(employeeId: number, answers: Record<Dichotomy, number[]>) {
    const existing = await prisma.employeeMBTIResult.findFirst({ where: { employeeId } });
    if (existing) return;
    await prisma.employeeMBTIResult.create({ data: { employeeId, ...resultPayload(answers) } });
  }

  await ensureEmployeeResult(staff1.id, { E_I: [-1, -2, 0], S_N: [1, 2, 1], T_F: [1, 0, 2], J_P: [2, 1, 3] }); // ISTJ
  await ensureEmployeeResult(staff1.id, { E_I: [1, 0, -1], S_N: [2, 1, 3], T_F: [2, 1, 1], J_P: [1, 2, 0] }); // retake
  await ensureEmployeeResult(staff2.id, { E_I: [3, 2, 2], S_N: [1, 2, 1], T_F: [0, 1, 0], J_P: [-3, -2, -2] }); // ESTP
  await ensureEmployeeResult(staff3.id, { E_I: [-2, -3, -1], S_N: [2, 3, 2], T_F: [3, 2, 3], J_P: [1, 0, 2] }); // INTJ
  await ensureEmployeeResult(hr.id, { E_I: [2, 3, 1], S_N: [3, 2, 2], T_F: [2, 1, 2], J_P: [2, 3, 1] }); // ENTJ

  console.log("Seed complete:");
  console.log("  HR: hr.exec@university.edu (Password123!)");
  console.log("  Employees: staff.sci@university.edu / nadia.rahman@university.edu / li.wei@university.edu (Password123!)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
