import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

let client: Client | null = null;

async function getClient() {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
  }
  return client;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.name;
    const pgClient = await getClient();

    const result = await pgClient.query(
      'SELECT settings FROM "UserSettings" WHERE "userId" = $1',
      [userId]
    );

    const settings = result.rows.length > 0 ? result.rows[0].settings : {};

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.name) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.name;
    const { settings } = await req.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings payload' },
        { status: 400 }
      );
    }

    const pgClient = await getClient();

    await pgClient.query(
      `INSERT INTO "UserSettings" ("userId", settings, "updatedAt") 
       VALUES ($1, $2, NOW())
       ON CONFLICT ("userId") DO UPDATE 
       SET settings = $2, "updatedAt" = NOW()`,
      [userId, JSON.stringify(settings)]
    );

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
