import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { programs, sessions } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';

const router = Router();

router.use(authenticate);

// List programs
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const list = await req.tenantDb!.query.programs.findMany({
      where: eq(programs.creatorId, req.user!.tenantId),
      orderBy: (programs: any, { desc }: any) => [desc(programs.createdAt)],
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create program
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, description, thumbnailUrl } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const [newProgram] = await req.tenantDb!.insert(programs).values({
      creatorId: req.user!.tenantId,
      title,
      description,
      thumbnailUrl,
    }).returning();

    await createAuditLog(req, 'CREATE', 'PROGRAM', newProgram.id);
    res.status(201).json(newProgram);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update program
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { title, description, thumbnailUrl } = req.body;
  const id = req.params.id as string;

  try {
    const [updated] = await req.tenantDb!.update(programs)
      .set({ title, description, thumbnailUrl, updatedAt: new Date() })
      .where(and(eq(programs.id, id), eq(programs.creatorId, req.user!.tenantId)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Program not found' });

    await createAuditLog(req, 'UPDATE', 'PROGRAM', updated.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete program
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    const [deleted] = await req.tenantDb!.delete(programs)
      .where(and(eq(programs.id, id), eq(programs.creatorId, req.user!.tenantId)))
      .returning();

    if (!deleted) return res.status(404).json({ error: 'Program not found' });

    await createAuditLog(req, 'DELETE', 'PROGRAM', id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
