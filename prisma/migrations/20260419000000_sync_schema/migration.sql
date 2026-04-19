-- AlterTable
ALTER TABLE "UserTarget" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "timestampMs" BIGINT NOT NULL,
    "externalDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CallLog_targetId_timestampMs_idx" ON "CallLog"("targetId", "timestampMs" DESC);

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Target"("id") ON DELETE CASCADE ON UPDATE CASCADE;
