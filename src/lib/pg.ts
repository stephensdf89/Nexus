import { Client } from "pg";

let client: Client | null = null;

export async function getPgClient() {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      query_timeout: 10000,
    });
    try {
      await client.connect();
    } catch (err) {
      client = null;
      throw err;
    }
  }

  return client;
}
