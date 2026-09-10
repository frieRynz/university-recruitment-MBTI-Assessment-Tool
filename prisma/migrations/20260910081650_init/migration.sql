-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'HR');

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
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
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

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "EmployeeMBTIResult_employeeId_timestamp_idx" ON "EmployeeMBTIResult"("employeeId", "timestamp");

-- AddForeignKey
ALTER TABLE "EmployeeMBTIResult" ADD CONSTRAINT "EmployeeMBTIResult_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
