import { Router } from "express";

import { appointmentRouter } from "./appointment.routes.js";
import { authRouter } from "./auth.routes.js";
import { doctorScheduleRouter } from "./doctor-schedule.routes.js";
import { doctorRouter } from "./doctor.routes.js";
import { healthRouter } from "./health.routes.js";
import { protectedRouter } from "./protected.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/appointments", appointmentRouter);
apiRouter.use("/doctor-schedules", doctorScheduleRouter);
apiRouter.use("/doctors", doctorRouter);
apiRouter.use(protectedRouter);
