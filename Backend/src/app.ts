import cookieParser from "cookie-parser";
import cors, { type CorsOptions } from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { apiRouter } from "./routes/index.js";

const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    const isAllowed =
      !origin || env.CORS_ORIGINS.includes("*") || env.CORS_ORIGINS.includes(origin);

    callback(isAllowed ? null : new Error("Origin is not allowed by CORS"), isAllowed);
  },
};

export const app = express();

app.disable("x-powered-by");
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
