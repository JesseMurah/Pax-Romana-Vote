/*
  Warnings:

  - The values [ORGANIZING_SECRETARY_ASST,PRO_ASSISTANT] on the enum `position` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "position_new" AS ENUM ('PRESIDENT', 'VICE_PRESIDENT', 'GEN_SECRETARY', 'FINANCIAL_SECRETARY', 'ORGANIZING_SECRETARY_MAIN', 'PRO_MAIN', 'WOMEN_COMMISSIONER');
ALTER TABLE "Nomination" ALTER COLUMN "nomineePosition" TYPE "position_new" USING ("nomineePosition"::text::"position_new");
ALTER TABLE "candidates" ALTER COLUMN "position" TYPE "position_new" USING ("position"::text::"position_new");
ALTER TYPE "position" RENAME TO "position_old";
ALTER TYPE "position_new" RENAME TO "position";
DROP TYPE "position_old";
COMMIT;
