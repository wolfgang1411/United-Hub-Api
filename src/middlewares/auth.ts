import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { HttpError } from "./error";

type AccessTokenPayload = JwtPayload & {
  sub: string;
  role: UserRole;
};

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token");
  }

  const token = authHeader.slice("Bearer ".length);
  let payload: AccessTokenPayload;

  try {
    payload = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
  } catch {
    throw new HttpError(401, "Invalid token");
  }

  req.auth = {
    userId: payload.sub,
    role: payload.role,
  };

  next();
}

export function requireSuperadmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.auth) {
    throw new HttpError(401, "Missing auth context");
  }

  if (req.auth.role !== UserRole.SUPERADMIN) {
    throw new HttpError(403, "Superadmin access required");
  }

  next();
}
