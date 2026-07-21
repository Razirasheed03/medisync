import "dotenv/config";

const nodeEnvironments = ["development", "test", "production"] as const;
const logLevels = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;

type NodeEnvironment = (typeof nodeEnvironments)[number];
type LogLevel = (typeof logLevels)[number];

export interface Environment {
  readonly NODE_ENV: NodeEnvironment;
  readonly PORT: number;
  readonly MONGODB_URI: string;
  readonly CORS_ORIGINS: readonly string[];
  readonly LOG_LEVEL: LogLevel;
}

const readRequired = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const readEnum = <T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T,
): T => {
  const value = process.env[name]?.trim() ?? fallback;

  if (!allowed.includes(value as T)) {
    throw new Error(`${name} must be one of: ${allowed.join(", ")}`);
  }

  return value as T;
};

const readPort = (): number => {
  const value = Number(process.env.PORT ?? 3000);

  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return value;
};

const readMongoUri = (): string => {
  const value = readRequired("MONGODB_URI");

  if (!value.startsWith("mongodb://") && !value.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must use the mongodb:// or mongodb+srv:// protocol");
  }

  return value;
};

export const env: Environment = Object.freeze({
  NODE_ENV: readEnum("NODE_ENV", nodeEnvironments, "development"),
  PORT: readPort(),
  MONGODB_URI: readMongoUri(),
  CORS_ORIGINS: Object.freeze(
    (process.env.CORS_ORIGIN ?? "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
  LOG_LEVEL: readEnum("LOG_LEVEL", logLevels, "info"),
});
