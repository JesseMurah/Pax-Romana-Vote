/*
  Warnings:

  - A unique constraint covering the columns `[verificationTokenId]` on the table `GuarantorVerification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GuarantorVerification" ADD COLUMN     "verificationTokenId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GuarantorVerification_verificationTokenId_key" ON "GuarantorVerification"("verificationTokenId");
