-- DropIndex
DROP INDEX "public"."Message_targetId_dedupeKey_key";

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "possibleNoise" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Message_targetId_dedupeKey_idx" ON "public"."Message"("targetId", "dedupeKey");
