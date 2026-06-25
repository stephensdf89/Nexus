import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SETTINGS_SCHEMA = {
  settings: {
    type: 'object',
    required: true,
  },
};

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  return { supabaseUrl, anonKey };
}

async function getAccessTokenFromRequest(req: NextRequest) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    accessToken = req.headers.get('x-supabase-auth') || undefined;
  }

  if (!accessToken) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    }
  }

  return accessToken;
}

async function getUserFromRequest(req: NextRequest) {
  try {
    const config = getSupabaseConfig();
    if (!config) {
      return { user: null, error: 'Supabase config missing' };
    }

    const accessToken = await getAccessTokenFromRequest(req);

    if (!accessToken) {
      return { user: null, error: 'Unauthorized' };
    }

    const userResponse = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: config.anonKey,
      },
      cache: 'no-store',
    });

    if (!userResponse.ok) {
      return { user: null, error: 'Unauthorized' };
    }

    const user = await userResponse.json();
    if (!user?.id) {
      return { user: null, error: 'Unauthorized' };
    }

    return { user: { id: user.id }, error: null };
  } catch (error) {
    return { user: null, error: 'Unauthorized' };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const config = getSupabaseConfig();
      if (!config) {
        return NextResponse.json({ settings: {} });
      }

      // Use REST API to fetch settings
      const response = await fetch(
        `${config.supabaseUrl}/rest/v1/UserSettings?userId=eq.${user.id}&select=settings`,
        {
          headers: {
            'Authorization': `Bearer ${config.anonKey}`,
            'apikey': config.anonKey,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        return NextResponse.json({ settings: {} });
      }

      const data = await response.json();
      return NextResponse.json({ settings: data[0]?.settings ?? {} });
    } catch (error) {
      return NextResponse.json({ settings: {} });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const hasSettingsObject = body && typeof body === 'object' && typeof body.settings === 'object';
    if (!hasSettingsObject) {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }

    const settings = body.settings;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    const config = getSupabaseConfig();
    if (!config) {
      return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
    }

    // First, check if record exists
    const checkResponse = await fetch(
      `${config.supabaseUrl}/rest/v1/UserSettings?userId=eq.${user.id}&select=id`,
      {
        headers: {
          'Authorization': `Bearer ${config.anonKey}`,
          'apikey': config.anonKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const existingRecords = await checkResponse.json();
    const exists = Array.isArray(existingRecords) && existingRecords.length > 0;

    let response;
    if (exists) {
      // Update existing record
      response = await fetch(
        `${config.supabaseUrl}/rest/v1/UserSettings?userId=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${config.anonKey}`,
            'apikey': config.anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            settings: settings,
            updatedAt: new Date().toISOString(),
          }),
        }
      );
    } else {
      // Insert new record
      response = await fetch(
        `${config.supabaseUrl}/rest/v1/UserSettings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.anonKey}`,
            'apikey': config.anonKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            userId: user.id,
            settings: settings,
            updatedAt: new Date().toISOString(),
          }),
        }
      );
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
