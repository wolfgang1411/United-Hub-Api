import { z } from "zod";

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().optional());

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const messagesQuerySchema = paginationSchema.extend({
  targetId: optionalText,
  packageName: optionalText,
  chatId: optionalText,
  chatTitle: optionalText,
  possibleNoise: z.preprocess((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return value;
    const lowered = value.toLowerCase().trim();
    if (lowered.length === 0) return undefined;
    if (lowered === "true") return true;
    if (lowered === "false") return false;
    return value;
  }, z.boolean().optional()),
  direction: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const lowered = value.toLowerCase().trim();
      return lowered.length === 0 ? undefined : lowered;
    },
    z.enum(["incoming", "outgoing"]).optional(),
  ),
  from: z.coerce.number().int().positive().optional(),
  to: z.coerce.number().int().positive().optional(),
});

export const notificationsQuerySchema = paginationSchema.extend({
  targetId: optionalText,
  packageName: optionalText,
  from: z.coerce.number().int().positive().optional(),
  to: z.coerce.number().int().positive().optional(),
});

export const chatsQuerySchema = paginationSchema.extend({
  targetId: optionalText,
  packageName: optionalText,
});
