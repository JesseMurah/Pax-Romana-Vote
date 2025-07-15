/*
  Warnings:

  - You are about to drop the `ec_reviews` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `VerificationToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('NOMINATOR_VERIFICATION', 'GUARANTOR_VERIFICATION', 'ONE_VERIFICATION', 'PASSWORD_RESET');

-- DropForeignKey
ALTER TABLE "ec_reviews" DROP CONSTRAINT "ec_reviews_nominationId_fkey";

-- DropForeignKey
ALTER TABLE "ec_reviews" DROP CONSTRAINT "ec_reviews_reviewerId_fkey";

-- AlterTable
ALTER TABLE "Nomination" ADD COLUMN     "approvalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "photoPublicId" TEXT,
ADD COLUMN     "rejectionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hasVoted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inkVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "programme" TEXT;

-- AlterTable
ALTER TABLE "VerificationToken" DROP COLUMN "type",
ADD COLUMN     "type" "TokenType" NOT NULL;

-- DropTable
DROP TABLE "ec_reviews";

-- DropEnum
DROP TYPE "token_types";

-- CreateTable
CREATE TABLE "EcReview" (
    "id" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "EcReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EcReview_nominationId_reviewerId_key" ON "EcReview"("nominationId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "EcReview" ADD CONSTRAINT "EcReview_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "Nomination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcReview" ADD CONSTRAINT "EcReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcReview" ADD CONSTRAINT "EcReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
