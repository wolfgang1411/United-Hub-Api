import { Router } from "express";
import * as retrievalController from "../controllers/retrieval.controller";
import { requireAuth } from "../middlewares/auth";
import { validateQuery } from "../middlewares/validate";
import {
  chatsQuerySchema,
  messagesQuerySchema,
  notificationsQuerySchema,
} from "../schemas/query.schemas";
import { asyncHandler } from "../utils/asyncHandler";

export const retrievalRouter = Router();

retrievalRouter.use(requireAuth);
retrievalRouter.get("/targets", asyncHandler(retrievalController.listTargets));
retrievalRouter.get("/apps", asyncHandler(retrievalController.listApps));
retrievalRouter.get(
  "/chats",
  validateQuery(chatsQuerySchema),
  asyncHandler(retrievalController.listChats),
);
retrievalRouter.get(
  "/messages",
  validateQuery(messagesQuerySchema),
  asyncHandler(retrievalController.listMessages),
);
retrievalRouter.get(
  "/notifications",
  validateQuery(notificationsQuerySchema),
  asyncHandler(retrievalController.listNotifications),
);
retrievalRouter.get(
  "/targets/:targetId/summary",
  asyncHandler(retrievalController.targetSummary),
);
retrievalRouter.get(
  "/stream/messages",
  asyncHandler(retrievalController.streamMessages),
);
