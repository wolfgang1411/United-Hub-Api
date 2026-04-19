import { createHash } from "crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeChatTitle(title: string | undefined | null): string {
  if (!title) return "unknown";
  return title.trim().toLowerCase();
}
