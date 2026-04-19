import { IngestionEventType, MessageDirection, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { sseEmit } from "../lib/sse";
import { normalizeChatTitle, sha256 } from "../utils/hash";
import { serializeBigInt } from "../utils/serialize";
import { logToDb } from "../utils/logger";
import { LogLevel } from "@prisma/client";

function resolveDeviceId(
  input: { deviceId?: string },
  fallback?: string,
): string {
  return input.deviceId ?? fallback ?? "unknown-device";
}

async function ensureTarget(deviceId: string) {
  return prisma.target.upsert({
    where: { deviceId },
    update: {},
    create: { deviceId },
  });
}

async function ensureApp(packageName: string, appName: string) {
  return prisma.app.upsert({
    where: { packageName },
    update: { name: appName },
    create: {
      packageName,
      name: appName,
    },
  });
}

function fallbackAppName(packageName: string): string {
  return (
    {
      "com.whatsapp": "WhatsApp",
      "com.whatsapp.w4b": "WhatsApp Business",
      "com.instagram.android": "Instagram",
      "com.bumble.app": "Bumble",
      "com.tinder": "Tinder",
      "com.snapchat.android": "Snapchat",
    }[packageName] ?? packageName
  );
}

async function ensureChat(targetId: string, appId: string, title?: string) {
  const actualTitle = title?.trim() || "Unknown";
  const normalizedKey = normalizeChatTitle(actualTitle);

  return prisma.chat.upsert({
    where: {
      targetId_appId_normalizedKey: {
        targetId,
        appId,
        normalizedKey,
      },
    },
    update: {
      title: actualTitle,
    },
    create: {
      targetId,
      appId,
      title: actualTitle,
      normalizedKey,
    },
  });
}

function toBigInt(value: number): bigint {
  return BigInt(Math.trunc(value));
}

export async function ingestAccessibility(
  payload: {
    type: string;
    source?: string;
    packageName: string;
    appName: string;
    chatTitle?: string;
    eventType: string;
    direction: "incoming" | "outgoing";
    text: string;
    className?: string;
    timestamp: number;
    deviceId?: string;
  },
  fallbackDeviceId?: string,
) {
  const deviceId = resolveDeviceId(payload, fallbackDeviceId);
  const [target, app] = await Promise.all([
    ensureTarget(deviceId),
    ensureApp(payload.packageName, payload.appName),
  ]);

  const chat = await ensureChat(target.id, app.id, payload.chatTitle);

  const direction =
    payload.direction === "incoming"
      ? MessageDirection.INCOMING
      : MessageDirection.OUTGOING;
  const dedupeKey = sha256(
    [
      payload.eventType,
      payload.direction,
      payload.text,
      String(payload.timestamp),
      payload.chatTitle ?? "",
      payload.packageName,
    ].join("|"),
  );

  const lastTenMessages = await prisma.message.findMany({
    where: {
      targetId: target.id,
      appId: app.id,
      chatId: chat.id,
    },
    orderBy: [{ createdAt: "desc" }],
    take: 30,
    select: { text: true },
  });

  const possibleNoise = lastTenMessages.some(
    (item) => item.text === payload.text,
  );

  const message = await prisma.message.create({
    data: {
      targetId: target.id,
      appId: app.id,
      chatId: chat.id,
      direction,
      eventType: payload.eventType,
      text: payload.text,
      timestampMs: toBigInt(payload.timestamp),
      className: payload.className,
      externalDeviceId: deviceId,
      dedupeKey,
      possibleNoise,
    },
  });

  await prisma.ingestionEvent.create({
    data: {
      targetId: target.id,
      appId: app.id,
      kind: IngestionEventType.ACCESSIBILITY,
      payload: payload as unknown as Prisma.InputJsonValue,
      timestampMs: toBigInt(payload.timestamp),
      externalDeviceId: deviceId,
    },
  });

  sseEmit(
    chat.id,
    serializeBigInt({
      id: message.id,
      chatId: message.chatId,
      targetId: message.targetId,
      appId: message.appId,
      text: message.text,
      direction: message.direction,
      timestampMs: message.timestampMs,
      possibleNoise: message.possibleNoise,
      createdAt: message.createdAt,
    }),
  );

  return { target, app, chat, message };
}

export async function ingestNotification(
  payload: {
    type?: string;
    source?: string;
    packageName: string;
    appName?: string;
    title?: string;
    message?: string;
    text?: string;
    timestamp: number;
    deviceId?: string;
  },
  fallbackDeviceId?: string,
) {
  const deviceId = resolveDeviceId(payload, fallbackDeviceId);
  const resolvedAppName =
    payload.appName?.trim() || fallbackAppName(payload.packageName);
  const [target, app] = await Promise.all([
    ensureTarget(deviceId),
    ensureApp(payload.packageName, resolvedAppName),
  ]);

  const resolvedTitle = payload.title?.trim() || "Unknown";
  const resolvedMessage = (payload.message || payload.text || "")?.trim();

  const notification = await prisma.notification.create({
    data: {
      targetId: target.id,
      appId: app.id,
      type: payload.type,
      source: payload.source,
      title: resolvedTitle,
      body: resolvedMessage || null,
      timestampMs: toBigInt(payload.timestamp),
      externalDeviceId: deviceId,
    },
  });

  let mirroredMessage = null;
  try {
    if (!resolvedMessage) {
      await logToDb(
        `Notification from ${payload.packageName} skipped mirroring: No message body. Title: "${resolvedTitle}". Payload: ${JSON.stringify(payload)}`,
        LogLevel.WARN,
      );
    }

    if (resolvedMessage) {
      const chat =
        resolvedTitle.toLowerCase() === "unknown"
          ? null
          : await ensureChat(target.id, app.id, resolvedTitle);
      const dedupeKey = sha256(
        [
          "NOTIFICATION",
          "incoming",
          resolvedMessage,
          String(payload.timestamp),
          resolvedTitle,
          payload.packageName,
        ].join("|"),
      );

      mirroredMessage = await prisma.message.create({
        data: {
          targetId: target.id,
          appId: app.id,
          chatId: chat?.id,
          direction: MessageDirection.INCOMING,
          eventType: "NOTIFICATION",
          text: resolvedMessage,
          timestampMs: toBigInt(payload.timestamp),
          className: "notification",
          externalDeviceId: deviceId,
          dedupeKey,
          possibleNoise: false,
        },
      });

      await logToDb(
        `Notification from ${payload.packageName} mirrored to message ${mirroredMessage.id}. Chat: ${resolvedTitle}`,
        LogLevel.INFO,
      );

      if (chat?.id) {
        sseEmit(
          chat.id,
          serializeBigInt({
            id: mirroredMessage.id,
            chatId: mirroredMessage.chatId,
            targetId: mirroredMessage.targetId,
            appId: mirroredMessage.appId,
            text: mirroredMessage.text,
            direction: mirroredMessage.direction,
            timestampMs: mirroredMessage.timestampMs,
            possibleNoise: mirroredMessage.possibleNoise,
            createdAt: mirroredMessage.createdAt,
          }),
        );
      } else {
        await logToDb(
          `Mirrored message created without chat ID for notification from ${payload.packageName}`,
          LogLevel.INFO,
        );
      }
    }
  } catch (err) {
    const error = err as Error;
    await logToDb(
      `Error during notification mirroring for ${payload.packageName}: ${error.message}\n${error.stack}`,
      LogLevel.ERROR,
    );
  }

  await prisma.ingestionEvent.create({
    data: {
      targetId: target.id,
      appId: app.id,
      kind: IngestionEventType.NOTIFICATION,
      payload: payload as unknown as Prisma.InputJsonValue,
      timestampMs: toBigInt(payload.timestamp),
      externalDeviceId: deviceId,
    },
  });

  return { target, app, notification, mirroredMessage };
}

export async function ingestLayoutDump(
  payload: {
    type: "layout_dump";
    packageName: string;
    appName?: string;
    timestamp: number;
    nodes: Array<Record<string, unknown>>;
    deviceId?: string;
  },
  fallbackDeviceId?: string,
) {
  const deviceId = resolveDeviceId(payload, fallbackDeviceId);
  const target = await ensureTarget(deviceId);
  const app = await ensureApp(
    payload.packageName,
    payload.appName ?? payload.packageName,
  );

  const event = await prisma.ingestionEvent.create({
    data: {
      targetId: target.id,
      appId: app.id,
      kind: IngestionEventType.LAYOUT_DUMP,
      payload: payload as unknown as Prisma.InputJsonValue,
      timestampMs: toBigInt(payload.timestamp),
      externalDeviceId: deviceId,
    },
  });

  return { target, app, event };
}

export async function ingestCall(
  payload: {
    type?: string;
    number: string;
    name?: string;
    timestamp: number;
    deviceId?: string;
  },
  fallbackDeviceId?: string,
) {
  const deviceId = resolveDeviceId(payload, fallbackDeviceId);
  const target = await ensureTarget(deviceId);

  const callLog = await prisma.callLog.create({
    data: {
      targetId: target.id,
      number: payload.number,
      name: payload.name || null,
      type: payload.type || null,
      timestampMs: toBigInt(payload.timestamp),
      externalDeviceId: deviceId,
    },
  });

  const event = await prisma.ingestionEvent.create({
    data: {
      targetId: target.id,
      kind: IngestionEventType.CALL,
      payload: payload as unknown as Prisma.InputJsonValue,
      timestampMs: toBigInt(payload.timestamp),
      externalDeviceId: deviceId,
    },
  });

  return { target, callLog, event };
}

export async function ingestUnknown(
  payload: Record<string, unknown>,
  fallbackDeviceId?: string,
) {
  const deviceId = resolveDeviceId(
    { deviceId: String(payload.deviceId ?? "") || undefined },
    fallbackDeviceId,
  );
  const target = await ensureTarget(deviceId);

  const event = await prisma.ingestionEvent.create({
    data: {
      targetId: target.id,
      kind: IngestionEventType.UNKNOWN,
      payload: payload as Prisma.InputJsonValue,
      externalDeviceId: deviceId,
    },
  });

  return { target, event };
}
