import dotenv from "dotenv";

dotenv.config();

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: readEnv("DATABASE_URL","https://adequate-mustang-usefully.ngrok-free.app"),
  jwtAccessSecret: readEnv("JWT_ACCESS_SECRET", 'j1mO7Ym97U2787Gvh6tA6C'),
  jwtRefreshSecret: readEnv("JWT_REFRESH_SECRET", 'K9L2e6Z0t3V0K811B0b7Q3'),
  jwtAccessTtl: readEnv("JWT_ACCESS_TTL", "24h"),
  jwtRefreshTtl: readEnv("JWT_REFRESH_TTL", "7d"),
  seedSuperadminEmail: readEnv("SEED_SUPERADMIN_EMAIL", "admin@gmail.com"),
  seedSuperadminPassword: readEnv("SEED_SUPERADMIN_PASSWORD", "admin@13636"),
};
