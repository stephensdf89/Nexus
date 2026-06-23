import { NextRequest, NextResponse } from 'next/server';
import { getPgClient } from '@/lib/pg';
import { requireSession, serverErrorResponse } from '@/lib/apiAuth';

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

export async function POST(req: NextRequest) {
  try {
    const sessionResult = await requireSession(req);
    if ("error" in sessionResult) {
      return sessionResult.error;
    }

    const { user } = sessionResult;
    const pgClient = await getPgClient();

    await pgClient.query(
      `INSERT INTO "UserSettings" ("userId", settings, "updatedAt") 
       VALUES ($1, $2, NOW())
       ON CONFLICT ("userId") DO UPDATE 
       SET settings = $2, "updatedAt" = NOW()`,
      [user.userId, JSON.stringify(DEFAULT_SETTINGS)]
    );

    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return serverErrorResponse(error);
  }
}
