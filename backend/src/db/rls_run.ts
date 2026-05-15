import pg from 'pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const runRlsManual = async () => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/wellspring',
  });

  console.log('Running RLS migration manually...');

  try {
    const sql = fs.readFileSync('./drizzle/0001_enable_rls.sql', 'utf8');
    await pool.query(sql);
    console.log('RLS applied successfully!');
  } catch (err) {
    console.error('Manual RLS failed:', err);
  } finally {
    await pool.end();
  }
};

runRlsManual();
