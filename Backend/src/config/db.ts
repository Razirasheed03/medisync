import mongoose from "mongoose";

import { logger } from "../lib/logger.js";
import { env } from "./env.js";

mongoose.connection.on("error", (error) => {
  logger.error({ error }, "MongoDB connection error");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });

  logger.info({ host: mongoose.connection.host }, "MongoDB connected");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB connection closed");
};
