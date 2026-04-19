import { Response } from "express";

const _clients = new Map<string, Set<Response>>();
const _heartbeatIntervals = new Map<string, NodeJS.Timeout>();

export function sseSubscribe(chatId: string, res: Response): () => void {
  if (!_clients.has(chatId)) {
    _clients.set(chatId, new Set());
    startHeartbeat(chatId);
  }
  _clients.get(chatId)!.add(res);

  return () => {
    const set = _clients.get(chatId);
    if (set) {
      set.delete(res);
      if (set.size === 0) {
        _clients.delete(chatId);
        stopHeartbeat(chatId);
      }
    }
  };
}

function startHeartbeat(chatId: string): void {
  const interval = setInterval(() => {
    const set = _clients.get(chatId);
    if (!set || set.size === 0) {
      stopHeartbeat(chatId);
      return;
    }

    for (const res of set) {
      try {
        res.write(": keepalive\n\n");
      } catch {
        // ignore — client disconnected
      }
    }
  }, 30000); // Every 30 seconds

  _heartbeatIntervals.set(chatId, interval);
}

function stopHeartbeat(chatId: string): void {
  const interval = _heartbeatIntervals.get(chatId);
  if (interval) {
    clearInterval(interval);
    _heartbeatIntervals.delete(chatId);
  }
}

export function sseEmit(chatId: string, data: unknown): void {
  const set = _clients.get(chatId);
  if (!set || set.size === 0) return;

  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
    } catch {
      // client disconnected — will be cleaned up on request close
    }
  }
}
