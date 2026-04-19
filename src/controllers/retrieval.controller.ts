import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import * as retrievalService from "../services/retrieval.service";
import { getAllowedTargetIds } from "../services/access.service";
import { sseSubscribe } from "../lib/sse";
import { serializeBigInt } from "../utils/serialize";
import { UserRole } from "@prisma/client";

function authScope(req: Request) {
  return {
    userId: req.auth!.userId,
    role: req.auth!.role,
  };
}

export async function listTargets(req: Request, res: Response): Promise<void> {
  const data = await retrievalService.listTargets(authScope(req));
  res.status(200).json(serializeBigInt(data));
}

export async function listApps(req: Request, res: Response): Promise<void> {
  const targetId = req.query.targetId ? String(req.query.targetId) : undefined;
  const data = await retrievalService.listApps(authScope(req), targetId);
  res.status(200).json(serializeBigInt(data));
}

export async function listChats(req: Request, res: Response): Promise<void> {
  const data = await retrievalService.listChats(
    authScope(req),
    req.query as any,
  );
  res.status(200).json(serializeBigInt(data));
}

export async function listMessages(req: Request, res: Response): Promise<void> {
  const data = await retrievalService.listMessages(
    authScope(req),
    req.query as any,
  );
  res.status(200).json(serializeBigInt(data));
}

export async function listNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  const data = await retrievalService.listNotifications(
    authScope(req),
    req.query as any,
  );
  res.status(200).json(serializeBigInt(data));
}

export async function targetSummary(
  req: Request,
  res: Response,
): Promise<void> {
  const targetId = String(req.params.targetId);
  const data = await retrievalService.targetSummary(authScope(req), targetId);
  res.status(200).json(serializeBigInt(data));
}

export async function streamMessages(
  req: Request,
  res: Response,
): Promise<void> {
  const chatId = req.query.chatId ? String(req.query.chatId) : undefined;
  if (!chatId) {
    res.status(400).json({ error: "chatId is required" });
    return;
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { targetId: true },
  });
  if (!chat) {
    res.status(404).json({ error: "Chat not found" });
    return;
  }

  const scope = authScope(req);
  if (scope.role !== UserRole.SUPERADMIN) {
    const allowed = await getAllowedTargetIds(scope.userId, scope.role);
    if (allowed && !allowed.includes(chat.targetId)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Content-Encoding", "identity");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  const unsubscribe = sseSubscribe(chatId, res);
  req.on("close", () => {
    unsubscribe();
  });
}
