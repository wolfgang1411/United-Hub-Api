import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { requireAuth, requireSuperadmin } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { createUserSchema, linkTargetSchema } from "../schemas/admin.schemas";
import { asyncHandler } from "../utils/asyncHandler";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireSuperadmin);
adminRouter.post(
  "/users",
  validateBody(createUserSchema),
  asyncHandler(adminController.createUser),
);
adminRouter.post(
  "/targets/link",
  validateBody(linkTargetSchema),
  asyncHandler(adminController.linkTarget),
);
adminRouter.delete(
  "/targets/link",
  validateBody(linkTargetSchema),
  asyncHandler(adminController.unlinkTarget),
);
