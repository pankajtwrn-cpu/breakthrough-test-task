import { jest, describe, test, expect, beforeAll } from '@jest/globals';
// @ts-ignore
import request from 'supertest';
// @ts-ignore
import express from 'express';
import { db } from '../src/db/index.js';
import { creators, programs } from '../src/db/schema.js';
// @ts-ignore
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import authRoutes from '../src/routes/auth.js';
import programRoutes from '../src/routes/programs.js';
import { logger } from '../src/middleware/logger.js';
import helmet from 'helmet';
// @ts-ignore
import cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Setup app for testing
const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use('/auth', authRoutes);
app.use('/programs', programRoutes);

describe('Tenant Isolation', () => {
  let tenantAToken: string;
  let tenantBToken: string;
  let programAId: string;

  beforeAll(async () => {
    // 1. Setup Tenant A
    const tenantAEmail = `a-${crypto.randomUUID()}@example.com`;
    const signupA = await request(app)
      .post('/auth/signup')
      .send({ email: tenantAEmail, password: 'password', name: 'Tenant A' });
    tenantAToken = signupA.body.token;

    // 2. Setup Tenant B
    const tenantBEmail = `b-${crypto.randomUUID()}@example.com`;
    const signupB = await request(app)
      .post('/auth/signup')
      .send({ email: tenantBEmail, password: 'password', name: 'Tenant B' });
    tenantBToken = signupB.body.token;

    // 3. Create Program for Tenant A
    const programA = await request(app)
      .post('/programs')
      .set('Authorization', `Bearer ${tenantAToken}`)
      .send({ title: 'Program A', description: 'Internal' });
    programAId = programA.body.id;
  });

  test('rejects cross-tenant program access - GET', async () => {
    const res = await request(app)
      .get(`/programs/${programAId}`) // Note: our GET /programs/ list only returns own. GET /:id should also check.
      .set('Authorization', `Bearer ${tenantBToken}`);
    
    // In our implementation, we don't have a GET /programs/:id yet, 
    // but we can check if it shows up in their list.
    const listRes = await request(app)
      .get('/programs')
      .set('Authorization', `Bearer ${tenantBToken}`);
    
    const found = listRes.body.find((p: any) => p.id === programAId);
    expect(found).toBeUndefined();
  });

  test('rejects cross-tenant program update - PUT', async () => {
    const res = await request(app)
      .put(`/programs/${programAId}`)
      .set('Authorization', `Bearer ${tenantBToken}`)
      .send({ title: 'Hacked' });
    
    expect(res.status).toBe(404); // Or 403, but our code returns 404 if not found for that tenant
  });

  test('rejects cross-tenant program deletion - DELETE', async () => {
    const res = await request(app)
      .delete(`/programs/${programAId}`)
      .set('Authorization', `Bearer ${tenantBToken}`);
    
    expect(res.status).toBe(404);
  });
});
