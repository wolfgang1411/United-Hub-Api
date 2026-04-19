import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  role: z.enum(["USER", "SUPERADMIN"]).default("USER"),
});

export const linkTargetSchema = z.object({
  userId: z.string().min(1),
  targetId: z.string().min(1),
});
