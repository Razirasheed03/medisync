import { z } from "zod";

import { DEPARTMENTS } from "../constants/department.js";

export const listDoctorsQuerySchema = z
  .object({
    department: z.enum(DEPARTMENTS).optional(),
  })
  .strict();
