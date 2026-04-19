import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middlewares/error";
import { sha256 } from "../utils/hash";

type TokenPayload = {
  sub: string;
  role: UserRole;
};

function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl as jwt.SignOptions["expiresIn"],
  });
}

function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl as jwt.SignOptions["expiresIn"],
  });
}

function decodeExpiry(token: string): Date {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    throw new HttpError(500, "Could not determine token expiry");
  }

  return new Date(decoded.exp * 1000);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const payload: TokenPayload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: decodeExpiry(refreshToken),
    },
  });

  return {
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshToken: string) {
  let payload: TokenPayload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as TokenPayload;
  } catch {
    throw new HttpError(401, "Invalid refresh token");
  }

  const tokenHash = sha256(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });
  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt < new Date()
  ) {
    throw new HttpError(401, "Refresh token expired or revoked");
  }

  const newAccessToken = signAccessToken({
    sub: payload.sub,
    role: payload.role,
  });
  return { accessToken: newAccessToken };
}
