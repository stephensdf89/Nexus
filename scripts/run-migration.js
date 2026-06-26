const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.error('Make sure .env.local exists and has DATABASE_URL defined');
  process.exit(1);
}

// Parse connection string
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration SQL
    const migrationPath = path.join(__dirname, 'user-settings-migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Running migration...');
    console.log(sql);
    
    await client.query(sql);
    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
