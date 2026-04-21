-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "messageTime" TEXT,
ADD COLUMN     "source" TEXT;

-- CreateIndex
CREATE INDEX "Message_targetId_appId_direction_timestampMs_idx" ON "public"."Message"("targetId", "appId", "direction", "timestampMs" DESC);
