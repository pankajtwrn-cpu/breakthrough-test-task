export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Program {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  programId: string;
  title: string;
  duration: number;
  position: number;
  instructorName: string;
  tags: string[];
  mediaUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'REORDER';
  entityType: 'PROGRAM' | 'SESSION';
  entityId: string;
  actorId: string;
  details: Record<string, unknown> | null;
  timestamp: string;
}

export interface ImportResult {
  total: number;
  imported: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}
