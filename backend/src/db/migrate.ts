import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/wellspring',
  });

  const db = drizzle(pool);

  console.log('Running migrations...');

  try {
    // This will run migrations from the 'drizzle' folder
    // Note: Drizzle's default migrator might not pick up manual SQL files without meta files
    // But let's try.
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
