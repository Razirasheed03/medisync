import mongoose from "mongoose";

import { logger } from "../lib/logger.js";
import { AppointmentModel } from "../models/appointment.model.js";
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

  // Drop obsolete unique-slot indexes (e.g. before ARRIVED was added)
  // and create any missing ones defined on the schema.
  await AppointmentModel.syncIndexes();

  logger.info({ host: mongoose.connection.host }, "MongoDB connected");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB connection closed");
};
