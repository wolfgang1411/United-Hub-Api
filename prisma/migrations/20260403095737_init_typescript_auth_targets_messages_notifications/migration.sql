-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "public"."MessageDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "public"."IngestionEventType" AS ENUM ('ACCESSIBILITY', 'NOTIFICATION', 'CALL', 'LOCATION', 'LAYOUT_DUMP', 'UNKNOWN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Target" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserTarget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."App" (
    "id" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Chat" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "normalizedKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "chatId" TEXT,
    "direction" "public"."MessageDirection" NOT NULL,
    "eventType" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestampMs" BIGINT NOT NULL,
    "className" TEXT,
    "externalDeviceId" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "type" TEXT,
    "source" TEXT,
    "timestampMs" BIGINT NOT NULL,
    "externalDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IngestionEvent" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "appId" TEXT,
    "kind" "public"."IngestionEventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "timestampMs" BIGINT,
    "externalDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "public"."RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Target_deviceId_key" ON "public"."Target"("deviceId");

-- CreateIndex
CREATE INDEX "Target_createdAt_idx" ON "public"."Target"("createdAt");

-- CreateIndex
CREATE INDEX "UserTarget_targetId_idx" ON "public"."UserTarget"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTarget_userId_targetId_key" ON "public"."UserTarget"("userId", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "App_packageName_key" ON "public"."App"("packageName");

-- CreateIndex
CREATE UNIQUE INDEX "App_name_key" ON "public"."App"("name");

-- CreateIndex
CREATE INDEX "Chat_appId_idx" ON "public"."Chat"("appId");

-- CreateIndex
CREATE INDEX "Chat_targetId_createdAt_idx" ON "public"."Chat"("targetId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_targetId_appId_normalizedKey_key" ON "public"."Chat"("targetId", "appId", "normalizedKey");

-- CreateIndex
CREATE INDEX "Message_targetId_timestampMs_idx" ON "public"."Message"("targetId", "timestampMs" DESC);

-- CreateIndex
CREATE INDEX "Message_chatId_timestampMs_idx" ON "public"."Message"("chatId", "timestampMs" DESC);

-- CreateIndex
CREATE INDEX "Message_appId_timestampMs_idx" ON "public"."Message"("appId", "timestampMs" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Message_targetId_dedupeKey_key" ON "public"."Message"("targetId", "dedupeKey");

-- CreateIndex
CREATE INDEX "Notification_targetId_timestampMs_idx" ON "public"."Notification"("targetId", "timestampMs" DESC);

-- CreateIndex
CREATE INDEX "Notification_appId_timestampMs_idx" ON "public"."Notification"("appId", "timestampMs" DESC);

-- CreateIndex
CREATE INDEX "IngestionEvent_targetId_createdAt_idx" ON "public"."IngestionEvent"("targetId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "IngestionEvent_kind_createdAt_idx" ON "public"."IngestionEvent"("kind", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTarget" ADD CONSTRAINT "UserTarget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTarget" ADD CONSTRAINT "UserTarget_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Target"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Target"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Target"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Target"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IngestionEvent" ADD CONSTRAINT "IngestionEvent_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."Target"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IngestionEvent" ADD CONSTRAINT "IngestionEvent_appId_fkey" FOREIGN KEY ("appId") REFERENCES "public"."App"("id") ON DELETE SET NULL ON UPDATE CASCADE;
