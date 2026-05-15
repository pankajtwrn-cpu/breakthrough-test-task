import { Router, Response } from 'express';
import { db } from '../db/index.js';
import { sessions, programs } from '../db/schema.js';
import { eq, and, asc, inArray } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';
import { importSessions } from '../services/importService.js';

const router = Router();

router.use(authenticate);

// List sessions for a program
router.get('/program/:programId', async (req: AuthRequest, res: Response) => {
  const programId = req.params.programId as string;
  try {
    // Verify program belongs to tenant first
    const program = await req.tenantDb!.query.programs.findFirst({
      where: and(eq(programs.id, programId), eq(programs.creatorId, req.user!.tenantId)),
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });

    const list = await req.tenantDb!.query.sessions.findMany({
      where: and(eq(sessions.programId, programId), eq(sessions.creatorId, req.user!.tenantId)),
      orderBy: [asc(sessions.position)],
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create session
router.post('/program/:programId', async (req: AuthRequest, res: Response) => {
  const programId = req.params.programId as string;
  const { title, duration, position, instructorName, tags, mediaUrl } = req.body;

  try {
    // Verify program belongs to tenant
    const program = await req.tenantDb!.query.programs.findFirst({
      where: and(eq(programs.id, programId), eq(programs.creatorId, req.user!.tenantId)),
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });

    const [newSession] = await req.tenantDb!.insert(sessions).values({
      programId: programId as string,
      creatorId: req.user!.tenantId as string,
      title: title as string,
      duration: duration as number,
      position: position as number,
      instructorName: instructorName as string,
      tags: (tags || []) as string[],
      mediaUrl: mediaUrl as string,
    }).returning();

    await createAuditLog(req, 'CREATE', 'SESSION', newSession.id);
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder sessions
router.patch('/program/:programId/reorder', async (req: AuthRequest, res: Response) => {
  const programId = req.params.programId as string;
  const { sessionIds } = req.body; // Array of session IDs in new order

  if (!Array.isArray(sessionIds)) return res.status(400).json({ error: 'sessionIds must be an array' });

  try {
    // Verify program belongs to tenant
    const program = await req.tenantDb!.query.programs.findFirst({
      where: and(eq(programs.id, programId), eq(programs.creatorId, req.user!.tenantId)),
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });

    // Update positions in a transaction
    await req.tenantDb!.transaction(async (tx) => {
      for (let i = 0; i < sessionIds.length; i++) {
        await tx.update(sessions)
          .set({ position: i, updatedAt: new Date() })
          .where(and(
            eq(sessions.id, sessionIds[i]),
            eq(sessions.programId, programId),
            eq(sessions.creatorId, req.user!.tenantId)
          ));
      }
    });

    await createAuditLog(req, 'REORDER', 'SESSION', programId, { sessionIds });
    res.json({ message: 'Reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update session
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { title, duration, instructorName, tags, mediaUrl } = req.body;

  try {
    const [updated] = await req.tenantDb!.update(sessions)
      .set({ 
        title, 
        duration: Number(duration), 
        instructorName, 
        tags: tags || [], 
        mediaUrl,
        updatedAt: new Date() 
      })
      .where(and(eq(sessions.id, id), eq(sessions.creatorId, req.user!.tenantId)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Session not found' });

    await createAuditLog(req, 'UPDATE', 'SESSION', updated.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete session
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    const [deleted] = await req.tenantDb!.delete(sessions)
      .where(and(eq(sessions.id, id), eq(sessions.creatorId, req.user!.tenantId)))
      .returning();

    if (!deleted) return res.status(404).json({ error: 'Session not found' });

    await createAuditLog(req, 'DELETE', 'SESSION', id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk import
router.post('/program/:programId/import', async (req: AuthRequest, res: Response) => {
  const programId = req.params.programId as string;
  const { csvData, clientBatchId } = req.body;

  if (!csvData || !clientBatchId) return res.status(400).json({ error: 'csvData and clientBatchId are required' });

  try {
    const result = await importSessions(req, programId, csvData, clientBatchId);
    res.json(result);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
});

// Pre-signed S3 URL mock
router.get('/signed-url', async (req: AuthRequest, res: Response) => {
  const { fileName, fileType } = req.query;
  
  // In a real app, this would call AWS S3 SDK
  // We mock it for now as requested
  const mockUrl = `https://mock-s3-bucket.s3.amazonaws.com/${req.user!.tenantId}/${Date.now()}-${fileName}`;
  const signedUrl = `${mockUrl}?X-Amz-Signature=mock-sig`;

  res.json({ uploadUrl: signedUrl, publicUrl: mockUrl });
});

export default router;
