import bcrypt from "bcrypt";
import {
  Schema,
  model,
  type HydratedDocument,
  type Model,
} from "mongoose";

import { env } from "../config/env.js";
import { DEPARTMENTS, type Department } from "../constants/department.js";
import { USER_ROLES, type UserRole } from "../constants/user-role.js";
import { USER_STATUSES, type UserStatus } from "../constants/user-status.js";

export interface User {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  department?: Department;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User, Model<User>>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: "ACTIVE",
      required: true,
      index: true,
    },
    department: {
      type: String,
      enum: DEPARTMENTS,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, returnedObject) => {
        const sanitized = returnedObject as unknown as Record<string, unknown>;
        delete sanitized.password;
        delete sanitized.refreshToken;
        return returnedObject;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
});

export const UserModel = model<User>("User", userSchema);
