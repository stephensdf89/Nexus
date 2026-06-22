require('dotenv').config({ path: '.env.local' });
const pg = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  console.log('Host:', url.hostname);
  console.log('Port:', url.port);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  try {
    await client.connect();
    console.log('✓ Connected to database');

    await client.query(`
      CREATE TABLE IF NOT EXISTS "UserSettings" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE NOT NULL,
        settings JSONB NOT NULL DEFAULT '{}'::jsonb,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✓ UserSettings table created successfully');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.code || error.message || error);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createTable();

