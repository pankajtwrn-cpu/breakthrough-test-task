import { parse } from 'csv-parse/sync';
import { db } from '../db/index.js';
import { sessions, importJobs, programs, NewSession } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../middleware/auth.js';
import { createAuditLog } from '../utils/audit.js';

interface CSVRecord {
  title?: string;
  duration?: string;
  position?: string;
  instructor_name?: string;
  tags?: string;
  media_url?: string;
}

interface ImportError {
  row: number;
  error: string;
}

interface ImportResult {
  total: number;
  imported: number;
  errors: ImportError[];
  [key: string]: unknown;
}

export const importSessions = async (
  req: AuthRequest,
  programId: string,
  csvData: string,
  clientBatchId: string
) => {
  const tenantId = req.user!.tenantId;

  // 1. Check idempotency
  const existingJob = await req.tenantDb!.query.importJobs.findFirst({
    where: and(eq(importJobs.clientBatchId, clientBatchId), eq(importJobs.creatorId, tenantId)),
  });

  if (existingJob) {
    return existingJob.result;
  }

  // 2. Verify program
  const program = await req.tenantDb!.query.programs.findFirst({
    where: and(eq(programs.id, programId), eq(programs.creatorId, tenantId)),
  });

  if (!program) throw new Error('Program not found');

  // 3. Parse CSV
  let records: CSVRecord[];
  try {
    records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    throw new Error('Invalid CSV format');
  }

  const validRecords: NewSession[] = [];
  const errors: ImportError[] = [];

  // 4. Validate rows
  records.forEach((record, index) => {
    const rowNum = index + 1;
    const { title, duration, position, instructor_name, tags, media_url } = record;

    if (!title || !duration || !position || !instructor_name) {
      errors.push({ row: rowNum, error: 'Missing required columns (title, duration, position, instructor_name)' });
      return;
    }

    const dur = parseInt(duration);
    const pos = parseInt(position);

    if (isNaN(dur) || isNaN(pos)) {
      errors.push({ row: rowNum, error: 'Duration and Position must be numbers' });
      return;
    }

    validRecords.push({
      programId,
      creatorId: tenantId,
      title,
      duration: dur,
      position: pos,
      instructorName: instructor_name,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      mediaUrl: media_url || null,
      clientImportId: `${clientBatchId}-${rowNum}`,
    });
  });

  // 5. Insert valid records in a transaction
  let importedCount = 0;
  if (validRecords.length > 0) {
    try {
      await req.tenantDb!.transaction(async (tx) => {
        for (const record of validRecords) {
          // Additional row-level idempotency just in case
          const existing = await tx.query.sessions.findFirst({
            where: and(eq(sessions.clientImportId, record.clientImportId), eq(sessions.creatorId, tenantId)),
          });
          if (!existing) {
            await tx.insert(sessions).values(record);
            importedCount++;
          }
        }
      });
    } catch (err) {
      const error = err as Error;
      console.error('Import transaction failed:', error);
      throw new Error('Import failed during database insertion');
    }
  }

  const result: ImportResult = {
    total: records.length,
    imported: importedCount,
    errors,
  };

  // 6. Record job completion
  await req.tenantDb!.insert(importJobs).values({
    creatorId: tenantId,
    clientBatchId,
    status: 'COMPLETED',
    result,
  });

  await createAuditLog(req, 'IMPORT', 'SESSION', programId, result);

  return result;
};
