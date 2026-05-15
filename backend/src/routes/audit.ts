import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { auditLogs } from '../db/schema.js';
import { eq, and, gte, lte, asc, desc } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// List audit logs with filters
router.get('/', async (req: AuthRequest, res: Response) => {
  const { action, startDate, endDate } = req.query;
  const tenantId = req.user!.tenantId;

  try {
    let conditions = [eq(auditLogs.creatorId, tenantId)];

    if (action) {
      conditions.push(eq(auditLogs.action, action as "CREATE" | "UPDATE" | "DELETE" | "IMPORT" | "REORDER"));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.timestamp, new Date(startDate as string)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.timestamp, new Date(endDate as string)));
    }

    const list = await req.tenantDb!.query.auditLogs.findMany({
      where: and(...conditions),
      orderBy: [desc(auditLogs.timestamp)],
      limit: 100,
    });

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
