import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate";
import { loginSchema, refreshSchema } from "../schemas/auth.schemas";
import { asyncHandler } from "../utils/asyncHandler";

export const authRouter = Router();

authRouter.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(authController.login),
);
authRouter.post(
  "/refresh",
  validateBody(refreshSchema),
  asyncHandler(authController.refresh),
);
