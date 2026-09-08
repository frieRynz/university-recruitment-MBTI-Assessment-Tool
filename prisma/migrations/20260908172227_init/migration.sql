-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FACULTY_STAFF', 'HR_EXECUTIVE', 'HIRING_MANAGER');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('DEPARTMENT_HEAD', 'DEAN', 'VICE_PROVOST', 'PROGRAM_DIRECTOR');

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SocialScore" AS ENUM ('E', 'I');

-- CreateEnum
CREATE TYPE "VisionScore" AS ENUM ('S', 'N');

-- CreateEnum
CREATE TYPE "DecisionScore" AS ENUM ('T', 'F');

-- CreateEnum
CREATE TYPE "LifestyleScore" AS ENUM ('P', 'J');

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FACULTY_STAFF',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeMBTIResult" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "socialRatingScore" "SocialScore" NOT NULL,
    "visionRatingScore" "VisionScore" NOT NULL,
    "decisionRatingScore" "DecisionScore" NOT NULL,
    "lifestyleRatingScore" "LifestyleScore" NOT NULL,
    "mbtiResult" TEXT NOT NULL,
    "decisionStyle" TEXT NOT NULL,
    "socialClarity" DOUBLE PRECISION NOT NULL,
    "visionClarity" DOUBLE PRECISION NOT NULL,
    "decisionClarity" DOUBLE PRECISION NOT NULL,
    "lifestyleClarity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EmployeeMBTIResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "status" "PositionStatus" NOT NULL DEFAULT 'OPEN',
    "postedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'EXTERNAL',
    "linkedEmployeeId" INTEGER,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateMBTIResult" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "socialRatingScore" "SocialScore" NOT NULL,
    "visionRatingScore" "VisionScore" NOT NULL,
    "decisionRatingScore" "DecisionScore" NOT NULL,
    "lifestyleRatingScore" "LifestyleScore" NOT NULL,
    "mbtiResult" TEXT NOT NULL,
    "decisionStyle" TEXT NOT NULL,
    "socialClarity" DOUBLE PRECISION NOT NULL,
    "visionClarity" DOUBLE PRECISION NOT NULL,
    "decisionClarity" DOUBLE PRECISION NOT NULL,
    "lifestyleClarity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CandidateMBTIResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentDecision" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "mbtiResultId" INTEGER NOT NULL,
    "status" "DecisionStatus" NOT NULL,
    "decidedById" INTEGER NOT NULL,
    "decisionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "RecruitmentDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "EmployeeMBTIResult_employeeId_timestamp_idx" ON "EmployeeMBTIResult"("employeeId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_linkedEmployeeId_key" ON "Candidate"("linkedEmployeeId");

-- CreateIndex
CREATE INDEX "CandidateMBTIResult_positionId_idx" ON "CandidateMBTIResult"("positionId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateMBTIResult_candidateId_positionId_key" ON "CandidateMBTIResult"("candidateId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentDecision_mbtiResultId_key" ON "RecruitmentDecision"("mbtiResultId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruitmentDecision_candidateId_positionId_key" ON "RecruitmentDecision"("candidateId", "positionId");

-- AddForeignKey
ALTER TABLE "EmployeeMBTIResult" ADD CONSTRAINT "EmployeeMBTIResult_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_linkedEmployeeId_fkey" FOREIGN KEY ("linkedEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateMBTIResult" ADD CONSTRAINT "CandidateMBTIResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateMBTIResult" ADD CONSTRAINT "CandidateMBTIResult_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentDecision" ADD CONSTRAINT "RecruitmentDecision_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentDecision" ADD CONSTRAINT "RecruitmentDecision_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentDecision" ADD CONSTRAINT "RecruitmentDecision_mbtiResultId_fkey" FOREIGN KEY ("mbtiResultId") REFERENCES "CandidateMBTIResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentDecision" ADD CONSTRAINT "RecruitmentDecision_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
