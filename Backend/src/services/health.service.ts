import { env } from "../config/env.js";

export interface HealthData {
  readonly uptime: string;
  readonly environment: string;
  readonly timestamp: string;
}

export const getHealth = (): HealthData => ({
  uptime: `${process.uptime().toFixed(2)}s`,
  environment: env.NODE_ENV,
  timestamp: new Date().toISOString(),
});
