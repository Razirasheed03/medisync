import type { Server as HttpServer } from "node:http";

import { Server as SocketIOServer } from "socket.io";

import { env } from "../config/env.js";
import { verifyAccessToken } from "../services/auth.service.js";
import { logger } from "./logger.js";

export type AppointmentSocketEvent =
  | "appointment:created"
  | "appointment:updated"
  | "appointment:cancelled";

let io: SocketIOServer | undefined;

/**
 * Attaches Socket.IO to the HTTP server. Connections must present a
 * valid access token in the handshake; every authenticated client
 * receives appointment lifecycle broadcasts.
 */
export const initializeSocket = (httpServer: HttpServer): void => {
  io = new SocketIOServer(httpServer, {
    cors: {
      credentials: true,
      origin: (origin, callback) => {
        const isAllowed =
          !origin ||
          env.CORS_ORIGINS.includes("*") ||
          env.CORS_ORIGINS.includes(origin);
        callback(
          isAllowed ? null : new Error("Origin is not allowed by CORS"),
          isAllowed,
        );
      },
    },
  });

  io.use((socket, next) => {
    const token: unknown = socket.handshake.auth.token;

    if (typeof token !== "string" || token.length === 0) {
      next(new Error("Authentication token is required"));
      return;
    }

    try {
      socket.data.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    logger.debug({ socketId: socket.id }, "Socket connected");
  });
};

/** Broadcasts an appointment lifecycle event to every connected client. */
export const emitAppointmentEvent = (
  event: AppointmentSocketEvent,
  payload: unknown,
): void => {
  io?.emit(event, payload);
};

export const closeSocket = async (): Promise<void> => {
  if (!io) return;
  await io.close();
  io = undefined;
};
