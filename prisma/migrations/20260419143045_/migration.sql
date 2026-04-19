-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "public"."logs" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "public"."LogLevel" NOT NULL DEFAULT 'INFO',

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);
