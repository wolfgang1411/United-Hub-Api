import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middlewares/error";
import { getAllowedTargetIds } from "./access.service";

type AuthScope = {
  userId: string;
  role: UserRole;
};

function paginate(page: number, pageSize: number) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

async function scopeFilter(scope: AuthScope, requestedTargetId?: string) {
  const allowedTargetIds = await getAllowedTargetIds(scope.userId, scope.role);

  if (
    scope.role !== UserRole.SUPERADMIN &&
    allowedTargetIds &&
    allowedTargetIds.length === 0
  ) {
    return { id: { in: [] as string[] } };
  }

  if (requestedTargetId) {
    if (
      scope.role !== UserRole.SUPERADMIN &&
      allowedTargetIds &&
      !allowedTargetIds.includes(requestedTargetId)
    ) {
      throw new HttpError(403, "Target is not linked to current user");
    }

    return { id: requestedTargetId };
  }

  if (scope.role === UserRole.SUPERADMIN) {
    return {};
  }

  return { id: { in: allowedTargetIds ?? [] } };
}

export async function listTargets(scope: AuthScope) {
  const where = await scopeFilter(scope);
  return prisma.target.findMany({
    where,
    include: {
      userTargets: {
        include: {
          user: {
            select: { id: true, email: true, role: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listApps(scope: AuthScope, targetId?: string) {
  const targetWhere = await scopeFilter(scope, targetId);
  return prisma.app.findMany({
    where: {
      OR: [
        { messages: { some: { target: targetWhere } } },
        { notifications: { some: { target: targetWhere } } },
      ],
    },
    orderBy: { name: "asc" },
  });
}

export async function listChats(
  scope: AuthScope,
  query: {
    page: number;
    pageSize: number;
    targetId?: string;
    packageName?: string;
  },
) {
  const targetWhere = await scopeFilter(scope, query.targetId);
  const where: Prisma.ChatWhereInput = {
    target: targetWhere,
    ...(query.packageName ? { app: { packageName: query.packageName } } : {}),
  };

  return prisma.chat.findMany({
    where,
    include: {
      app: true,
      target: true,
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
    ...paginate(query.page, query.pageSize),
  });
}

export async function listMessages(
  scope: AuthScope,
  query: {
    page: number;
    pageSize: number;
    targetId?: string;
    packageName?: string;
    chatId?: string;
    chatTitle?: string;
    possibleNoise?: boolean;
    direction?: "incoming" | "outgoing";
    from?: number;
    to?: number;
  },
) {
  const targetWhere = await scopeFilter(scope, query.targetId);

  const where: Prisma.MessageWhereInput = {
    target: targetWhere,
    ...(query.packageName ? { app: { packageName: query.packageName } } : {}),
    ...(query.chatId ? { chatId: query.chatId } : {}),
    ...(query.chatTitle ? { chat: { title: query.chatTitle } } : {}),
    ...(query.possibleNoise !== undefined
      ? { possibleNoise: query.possibleNoise }
      : {}),
    ...(query.direction
      ? {
          direction: query.direction === "incoming" ? "INCOMING" : "OUTGOING",
        }
      : {}),
    ...(query.from || query.to
      ? {
          timestampMs: {
            ...(query.from ? { gte: BigInt(query.from) } : {}),
            ...(query.to ? { lte: BigInt(query.to) } : {}),
          },
        }
      : {}),
  };

  return prisma.message.findMany({
    where,
    include: {
      app: true,
      chat: true,
      target: true,
    },
    orderBy: [{ timestampMs: "desc" }, { createdAt: "desc" }],
    ...paginate(query.page, query.pageSize),
  });
}

export async function listNotifications(
  scope: AuthScope,
  query: {
    page: number;
    pageSize: number;
    targetId?: string;
    packageName?: string;
    from?: number;
    to?: number;
  },
) {
  const targetWhere = await scopeFilter(scope, query.targetId);
  const where: Prisma.NotificationWhereInput = {
    target: targetWhere,
    ...(query.packageName ? { app: { packageName: query.packageName } } : {}),
    ...(query.from || query.to
      ? {
          timestampMs: {
            ...(query.from ? { gte: BigInt(query.from) } : {}),
            ...(query.to ? { lte: BigInt(query.to) } : {}),
          },
        }
      : {}),
  };

  return prisma.notification.findMany({
    where,
    include: {
      app: true,
      target: true,
    },
    orderBy: [{ timestampMs: "desc" }, { createdAt: "desc" }],
    ...paginate(query.page, query.pageSize),
  });
}

export async function targetSummary(scope: AuthScope, targetId: string) {
  const targetWhere = await scopeFilter(scope, targetId);
  const target = await prisma.target.findFirst({ where: targetWhere });
  if (!target) {
    throw new HttpError(404, "Target not found");
  }

  const [
    messagesCount,
    notificationsCount,
    chatsCount,
    latestMessage,
    latestNotification,
  ] = await Promise.all([
    prisma.message.count({ where: { targetId: target.id } }),
    prisma.notification.count({ where: { targetId: target.id } }),
    prisma.chat.count({ where: { targetId: target.id } }),
    prisma.message.findFirst({
      where: { targetId: target.id },
      orderBy: [{ timestampMs: "desc" }, { createdAt: "desc" }],
    }),
    prisma.notification.findFirst({
      where: { targetId: target.id },
      orderBy: [{ timestampMs: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return {
    target,
    stats: {
      messagesCount,
      notificationsCount,
      chatsCount,
      latestMessageAt: latestMessage?.createdAt ?? null,
      latestNotificationAt: latestNotification?.createdAt ?? null,
    },
  };
}
