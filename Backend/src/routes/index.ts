import { Router } from "express";

import { appointmentRouter } from "./appointment.routes.js";
import { auditLogRouter } from "./audit-log.routes.js";
import { authRouter } from "./auth.routes.js";
import { departmentRouter } from "./department.routes.js";
import { doctorScheduleRouter } from "./doctor-schedule.routes.js";
import { doctorRouter } from "./doctor.routes.js";
import { healthRouter } from "./health.routes.js";
import { patientRouter } from "./patient.routes.js";
import { protectedRouter } from "./protected.routes.js";
import { userRouter } from "./user.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/appointments", appointmentRouter);
apiRouter.use("/audit-logs", auditLogRouter);
apiRouter.use("/departments", departmentRouter);
apiRouter.use("/doctor-schedules", doctorScheduleRouter);
apiRouter.use("/doctors", doctorRouter);
apiRouter.use("/patients", patientRouter);
apiRouter.use("/users", userRouter);
apiRouter.use(protectedRouter);
