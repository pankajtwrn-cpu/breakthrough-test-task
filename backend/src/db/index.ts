import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/wellspring',
});

// Default shared DB (careful with this one, use for auth/system tasks)
export const db = drizzle(pool, { schema });

// Helper to get a tenant-scoped DB instance
// This is essential for RLS enforcement at the data layer
export const getTenantDb = async (tenantId: string) => {
  const client = await pool.connect();
  let released = false;
  try {
    // Set the session variable that RLS policies use
    await client.query(`SET app.current_tenant = '${tenantId}'`);
    return {
      db: drizzle(client, { schema }),
      release: async () => {
        if (released) return;
        released = true;
        try {
          await client.query(`RESET app.current_tenant`);
        } catch (e) {
          console.error('Failed to reset app.current_tenant', e);
        }
        client.release();
      }
    };
  } catch (err) {
    client.release();
    throw err;
  }
};
