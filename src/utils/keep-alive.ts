import { prisma } from "../lib/prisma";

/**
 * Periodically fetches the first user from the database to keep the connection alive.
 * This prevents the database from sleeping due to inactivity.
 */
export function startKeepAliveCron() {
  const NINE_MINUTES = 9 * 60 * 1000;

  console.log("[Keep-Alive] Initializing database keep-alive cron (9m interval)...");

  // Run immediately on start
  keepAlive();

  // Set interval
  setInterval(keepAlive, NINE_MINUTES);
}

async function keepAlive() {
  try {
    const user = await prisma.user.findFirst();
    console.log(`[${new Date().toISOString()}] [Keep-Alive] DB call successful. User count: ${user ? 1 : 0}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [Keep-Alive] DB call failed:`, error);
  }
}
