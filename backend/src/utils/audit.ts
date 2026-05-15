import { db } from '../db/index.js';
import { auditLogs, actionEnum, entityEnum } from '../db/schema.js';
import { AuthRequest } from '../middleware/auth.js';

type ActionType = (typeof actionEnum.enumValues)[number];
type EntityType = (typeof entityEnum.enumValues)[number];

export const createAuditLog = async (
  req: AuthRequest,
  action: ActionType,
  entityType: EntityType,
  entityId: string,
  details: Record<string, unknown> = {}
) => {
  if (!req.user || !req.tenantDb) return;

  try {
    await req.tenantDb.insert(auditLogs).values({
      creatorId: req.user.tenantId,
      actorId: req.user.id,
      action,
      entityType,
      entityId,
      details,
      requestId: req.headers['x-request-id'] as string,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
