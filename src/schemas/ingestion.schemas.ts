import { z } from "zod";

const unixMs = z.coerce.number().int().positive();

export const notificationIngestSchema = z.object({
  type: z.string().optional(),
  source: z.string().optional(),
  packageName: z.string().min(1),
  appName: z.string().min(1).optional(),
  title: z.string().optional(),
  message: z.string().optional(),
  text: z.string().optional(),
  timestamp: unixMs,
  deviceId: z.string().min(1).optional(),
});

export const accessibilityIngestSchema = z.object({
  type: z.string().min(1),
  source: z.string().optional(),
  packageName: z.string().min(1),
  appName: z.string().min(1),
  chatTitle: z.string().optional(),
  eventType: z.string().min(1),
  direction: z.enum(["incoming", "outgoing"]),
  text: z.string().min(1),
  className: z.string().optional(),
  timestamp: unixMs,
  deviceId: z.string().min(1).optional(),
});

const layoutNodeSchema = z.object({
  depth: z.number(),
  id: z.string().optional(),
  text: z.string().optional(),
  hint: z.string().optional(),
  class: z.string().optional(),
  bounds: z.string().optional(),
});

export const layoutDumpSchema = z.object({
  type: z.literal("layout_dump"),
  packageName: z.string().min(1),
  appName: z.string().optional(),
  timestamp: unixMs,
  nodes: z.array(layoutNodeSchema),
  deviceId: z.string().min(1).optional(),
});

export const callIngestSchema = z.object({
  type: z.string().optional(),
  number: z.string().min(1),
  name: z.string().optional(),
  timestamp: unixMs,
  deviceId: z.string().min(1).optional(),
});

export const genericIngestSchema = z.record(z.string(), z.any());
