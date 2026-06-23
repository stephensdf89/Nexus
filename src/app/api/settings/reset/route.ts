import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Default settings template
const DEFAULT_SETTINGS = {
  globalSettings: {
    highContrast: false,
    textSize: 'medium',
    colorBlindMode: 'none',
    reducedMotion: false,
    disableNeon: false,
    safeMode: false,
    theme: 'neon',
    compactMode: false,
    language: 'en',
    sidebarCollapsed: false,
    dashboardLayout: 'default',
    showAnalyticsPreview: true,
    showCreatorToolsPreview: true,
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: false,
    aiMode: 'standard',
  },
  desktopSettings: {},
  mobileSettings: {},
  tabletSettings: {},
};

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
    const pgClient = await getClient();

    await pgClient.query(
      `INSERT INTO "UserSettings" ("userId", settings, "updatedAt") 
       VALUES ($1, $2, NOW())
       ON CONFLICT ("userId") DO UPDATE 
       SET settings = $2, "updatedAt" = NOW()`,
      [userId, JSON.stringify(DEFAULT_SETTINGS)]
    );

    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset settings' },
      { status: 500 }
    );
  }
}
