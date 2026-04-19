import { Router } from "express";
import * as ingestController from "../controllers/ingest.controller";
import { validateBody } from "../middlewares/validate";
import {
  accessibilityIngestSchema,
  callIngestSchema,
  genericIngestSchema,
  layoutDumpSchema,
  notificationIngestSchema,
} from "../schemas/ingestion.schemas";
import { asyncHandler } from "../utils/asyncHandler";

export const ingestRouter = Router();

ingestRouter.post(
  "/notification",
  validateBody(notificationIngestSchema),
  asyncHandler(ingestController.notification),
);
ingestRouter.post(
  "/accessibility",
  validateBody(accessibilityIngestSchema),
  asyncHandler(ingestController.accessibility),
);
ingestRouter.post(
  "/layout-dump",
  validateBody(layoutDumpSchema),
  asyncHandler(ingestController.layoutDump),
);
ingestRouter.post(
  "/call",
  validateBody(callIngestSchema),
  asyncHandler(ingestController.call),
);
ingestRouter.post(
  "/location",
  validateBody(genericIngestSchema),
  asyncHandler(ingestController.unknown),
);
ingestRouter.post(
  "*",
  validateBody(genericIngestSchema),
  asyncHandler(ingestController.unknown),
);
