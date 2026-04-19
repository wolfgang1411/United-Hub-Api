import { Request, Response } from "express";
import * as ingestService from "../services/ingest.service";

function fallbackDeviceId(req: Request): string | undefined {
  const headerValue = req.header("x-device-id");
  return headerValue || undefined;
}

export async function notification(req: Request, res: Response): Promise<void> {
  const result = await ingestService.ingestNotification(
    req.body,
    fallbackDeviceId(req),
  );
  res.status(200).json({ status: "ok", id: result.notification.id });
}

export async function accessibility(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await ingestService.ingestAccessibility(
    req.body,
    fallbackDeviceId(req),
  );
  res.status(200).json({ status: "ok", id: result.message.id });
}

export async function layoutDump(req: Request, res: Response): Promise<void> {
  const result = await ingestService.ingestLayoutDump(
    req.body,
    fallbackDeviceId(req),
  );
  res.status(200).json({ status: "ok", id: result.event.id });
}

export async function call(req: Request, res: Response): Promise<void> {
  const result = await ingestService.ingestCall(
    req.body,
    fallbackDeviceId(req),
  );
  res.status(200).json({ status: "ok", id: result.callLog.id });
}

export async function unknown(req: Request, res: Response): Promise<void> {
  const result = await ingestService.ingestUnknown(
    req.body,
    fallbackDeviceId(req),
  );
  res.status(200).json({ status: "ok", id: result.event.id });
}
