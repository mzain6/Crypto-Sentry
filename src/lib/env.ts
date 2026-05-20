type AppEnv = {
  databaseUrl: string;
  coingeckoApiKey: string | null;
  coinIngestLimit: number;
  coinIngestIntervalSeconds: number;
  nextAuthUrl: string;
  nextAuthSecret: string;
  googleClientId: string | null;
  googleClientSecret: string | null;
  resendApiKey: string | null;
  authFromEmail: string | null;
};

function readIntegerEnv(name: string, fallback: number) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export const env: AppEnv = {
  databaseUrl: readRequiredEnv("DATABASE_URL"),
  coingeckoApiKey: process.env.COINGECKO_API_KEY || null,
  coinIngestLimit: readIntegerEnv("COIN_INGEST_LIMIT", 50),
  coinIngestIntervalSeconds: readIntegerEnv(
    "COIN_INGEST_INTERVAL_SECONDS",
    30,
  ),
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  nextAuthSecret: readRequiredEnv("NEXTAUTH_SECRET"),
  googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
  resendApiKey: process.env.RESEND_API_KEY || null,
  authFromEmail: process.env.AUTH_FROM_EMAIL || null,
};
