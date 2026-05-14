-- CreateEnum
CREATE TYPE "position" AS ENUM ('PRESIDENT', 'VICE_PRESIDENT', 'GEN_SECRETARY', 'FINANCIAL_SECRETARY', 'ORGANIZING_SECRETARY_MAIN', 'PRO_MAIN', 'WOMEN_COMMISSIONER');

-- CreateEnum
CREATE TYPE "genders" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "nomination_statuses" AS ENUM ('PENDING', 'AWAITING_VERIFICATION', 'PARTIALLY_VERIFIED', 'VERIFIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('NOMINATOR_VERIFICATION', 'GUARANTOR_VERIFICATION', 'ONE_VERIFICATION', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "VerificationTargetType" AS ENUM ('NOMINATOR', 'GUARANTOR');

-- CreateEnum
CREATE TYPE "user_roles" AS ENUM ('VOTER', 'ASPIRANT', 'EC_MEMBER', 'SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "voting_statuses" AS ENUM ('NOT_STARTED', 'ACTIVE', 'COMPLETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "verification_statuses" AS ENUM ('PENDING', 'VERIFIED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "role" "user_roles" NOT NULL DEFAULT 'VOTER',
    "programme" TEXT,
    "level" TEXT,
    "subgroup" TEXT,
    "college" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hasVoted" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subgroupId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nomination" (
    "id" TEXT NOT NULL,
    "aspirantId" TEXT NOT NULL,
    "nomineeName" TEXT NOT NULL,
    "nomineeEmail" TEXT NOT NULL,
    "nomineeContact" TEXT NOT NULL,
    "nomineePosition" "position" NOT NULL,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "status" "nomination_statuses" NOT NULL DEFAULT 'PENDING',
    "nomineeCollege" TEXT NOT NULL,
    "nomineeDepartment" TEXT NOT NULL,
    "nomineeDateOfBirth" TIMESTAMP(3) NOT NULL,
    "nomineeHostel" TEXT NOT NULL,
    "nomineeRoom" TEXT NOT NULL,
    "nomineeSex" TEXT NOT NULL,
    "nomineeCwa" TEXT NOT NULL,
    "nomineeProgramme" TEXT NOT NULL,
    "nomineeLevel" TEXT NOT NULL,
    "nomineeParish" TEXT NOT NULL,
    "nomineeNationality" TEXT NOT NULL,
    "nomineeRegion" TEXT NOT NULL,
    "nomineeSubgroups" TEXT[],
    "nomineeEducation" TEXT[],
    "hasLeadershipPosition" BOOLEAN NOT NULL,
    "leadershipPositions" TEXT[],
    "hasServedCommittee" BOOLEAN NOT NULL,
    "committees" TEXT[],
    "skills" TEXT[],
    "visionForOffice" TEXT[],
    "knowledgeAboutOffice" TEXT[],
    "approvalCount" INTEGER NOT NULL DEFAULT 0,
    "rejectionCount" INTEGER NOT NULL DEFAULT 0,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subgroupId" TEXT,

    CONSTRAINT "Nomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NominatorVerification" (
    "id" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "programme" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "subgroup" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NominatorVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuarantorVerification" (
    "id" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "programme" TEXT NOT NULL,
    "subgroup" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuarantorVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcReview" (
    "id" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationId" TEXT NOT NULL,
    "verificationType" "VerificationTargetType" NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "position" "position" NOT NULL,
    "photoUrl" TEXT,
    "photoPublicId" TEXT,
    "biography" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "candidateNumber" INTEGER NOT NULL,
    "nominationId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "voterHash" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" "voting_statuses" NOT NULL DEFAULT 'ACTIVE',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "voting_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encryptedVote" TEXT NOT NULL,
    "voterHash" TEXT NOT NULL,
    "submissionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceFingerprint" TEXT,
    "ipAddress" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subgroups" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subgroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "college" TEXT,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_timeline" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phase" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "gracePeriodHours" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "automaticTransition" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "election_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "NominatorVerification_nominationId_key" ON "NominatorVerification"("nominationId");

-- CreateIndex
CREATE UNIQUE INDEX "EcReview_nominationId_reviewerId_key" ON "EcReview"("nominationId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_candidateNumber_key" ON "candidates"("candidateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_nominationId_key" ON "candidates"("nominationId");

-- CreateIndex
CREATE UNIQUE INDEX "voting_sessions_sessionId_key" ON "voting_sessions"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "subgroups_name_key" ON "subgroups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "programmes_name_key" ON "programmes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "election_timeline_phase_key" ON "election_timeline"("phase");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "subgroups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nomination" ADD CONSTRAINT "Nomination_aspirantId_fkey" FOREIGN KEY ("aspirantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nomination" ADD CONSTRAINT "Nomination_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "subgroups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NominatorVerification" ADD CONSTRAINT "NominatorVerification_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "Nomination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuarantorVerification" ADD CONSTRAINT "GuarantorVerification_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "Nomination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcReview" ADD CONSTRAINT "EcReview_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "Nomination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcReview" ADD CONSTRAINT "EcReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "Nomination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_sessions" ADD CONSTRAINT "voting_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "voting_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

