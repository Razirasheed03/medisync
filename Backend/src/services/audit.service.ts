import type {
  AuditAction,
  AuditEntityType,
} from "../constants/audit-action.js";
import type { UserRole } from "../constants/user-role.js";
import { logger } from "../lib/logger.js";
import {
  AuditLogModel,
  type AuditLogDocument,
} from "../models/audit-log.model.js";

export interface AuditActor {
  readonly id: string;
  readonly name: string;
  readonly role: UserRole;
}

export interface AuditEventInput {
  readonly actor: AuditActor;
  readonly action: AuditAction;
  readonly entityType: AuditEntityType;
  readonly entityId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AuditLogResponse {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly role: UserRole;
  readonly action: AuditAction;
  readonly entityType: AuditEntityType;
  readonly entityId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: Date;
}

export interface ListAuditLogsInput {
  readonly action?: AuditAction;
  readonly page: number;
  readonly limit: number;
}

export interface AuditLogPagination {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface ListAuditLogsResult {
  readonly logs: readonly AuditLogResponse[];
  readonly pagination: AuditLogPagination;
}

const toAuditLogResponse = (log: AuditLogDocument): AuditLogResponse => ({
  id: log.id as string,
  userId: log.user.toString(),
  userName: log.userName,
  role: log.role,
  action: log.action,
  entityType: log.entityType,
  ...(log.entityId ? { entityId: log.entityId.toString() } : {}),
  ...(log.metadata ? { metadata: log.metadata } : {}),
  createdAt: log.createdAt,
});

/**
 * Persists an audit event. Failures are logged but never propagated so
 * that auditing can never break the business operation it describes.
 */
export const recordAuditEvent = async (
  input: AuditEventInput,
): Promise<void> => {
  try {
    await AuditLogModel.create({
      user: input.actor.id,
      userName: input.actor.name,
      role: input.actor.role,
      action: input.action,
      entityType: input.entityType,
      ...(input.entityId ? { entityId: input.entityId } : {}),
      ...(input.metadata ? { metadata: input.metadata } : {}),
    });
  } catch (error) {
    logger.error({ error, action: input.action }, "Failed to record audit event");
  }
};

export const listAuditLogs = async (
  input: ListAuditLogsInput,
): Promise<ListAuditLogsResult> => {
  const filter = input.action ? { action: input.action } : {};
  const skip = (input.page - 1) * input.limit;

  const [logs, total] = await Promise.all([
    AuditLogModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(input.limit),
    AuditLogModel.countDocuments(filter),
  ]);

  return {
    logs: logs.map(toAuditLogResponse),
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  };
};
