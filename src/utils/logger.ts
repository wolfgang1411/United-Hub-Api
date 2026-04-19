import { LogLevel } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function logToDb(message: string, level: LogLevel = LogLevel.INFO) {
  try {
    await prisma.logs.create({
      data: {
        message,
        level,
      },
    });
  } catch (error) {
    console.error("Failed to write log to DB:", error);
  }
}
