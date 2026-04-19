import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);
  const data = await authService.login(email, password);
  res.status(200).json(data);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  const data = await authService.refresh(refreshToken);
  res.status(200).json(data);
}
