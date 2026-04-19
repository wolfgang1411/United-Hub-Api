import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import * as adminService from "../services/admin.service";

export async function createUser(req: Request, res: Response): Promise<void> {
  const user = await adminService.createUser({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    role: req.body.role as UserRole,
  });

  res.status(201).json(user);
}

export async function linkTarget(req: Request, res: Response): Promise<void> {
  const result = await adminService.linkTargetToUser(
    req.body.userId,
    req.body.targetId,
  );
  res.status(200).json(result);
}

export async function unlinkTarget(req: Request, res: Response): Promise<void> {
  const result = await adminService.unlinkTargetFromUser(
    req.body.userId,
    req.body.targetId,
  );
  res.status(200).json(result);
}
