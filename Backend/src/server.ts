import type { Server } from "node:http";

import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

let server: Server | undefined;
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "HTTP server started");
  });
};

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, "Graceful shutdown started");

  const forceExitTimer = setTimeout(() => {
    logger.fatal("Graceful shutdown timed out");
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await disconnectDatabase();
  clearTimeout(forceExitTimer);
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("unhandledRejection", (error) => {
  logger.fatal({ error }, "Unhandled promise rejection");
  void shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught exception");
  void shutdown("uncaughtException");
});

startServer().catch((error: unknown) => {
  logger.fatal({ error }, "Server startup failed");
  process.exit(1);
});
