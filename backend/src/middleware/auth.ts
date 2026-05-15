import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getTenantDb } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
    tenantId: string;
  };
  tenantDb?: NodePgDatabase<typeof schema>;
};

interface JwtPayload {
  id: string;
  email: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    const tenantId = decoded.id;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      tenantId: tenantId,
    };

    const { db, release } = await getTenantDb(tenantId);
    req.tenantDb = db;

    res.on('finish', () => release());
    res.on('close', () => release());

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
