import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { getTenantDb } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
    tenantId: string;
  };
  tenantDb?: any;
};

export const authenticate = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const tenantId = decoded.id;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      tenantId: tenantId,
    };

    // Get scoped DB for RLS
    const { db, release } = await getTenantDb(tenantId);
    req.tenantDb = db;

    // Ensure connection is released when request finishes
    res.on('finish', () => release());
    res.on('close', () => release());

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
