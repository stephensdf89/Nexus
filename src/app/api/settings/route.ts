import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  validateRequestBody,
  type ValidationSchema,
} from '@/lib/requestValidation';

const SETTINGS_SCHEMA: ValidationSchema = {
  settings: {
    type: 'object',
    required: true,
  },
};

async function getUserFromRequest() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    console.log('[Settings API] Auth check:', {
      hasToken: !!accessToken,
      tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none'
    });

    if (!accessToken) {
      console.log('[Settings API] No access token found');
      return { user: null, error: 'Unauthorized' };
    }

    // Decode JWT to get user ID (payload is between first and second dots)
    try {
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Add padding if needed for base64
      const padding = '='.repeat((4 - (parts[1].length % 4)) % 4);
      const payload = JSON.parse(
        Buffer.from(parts[1] + padding, 'base64').toString()
      );
      
      const userId = payload.sub;
      console.log('[Settings API] User authenticated:', { userId });
      
      if (!userId) {
        return { user: null, error: 'Invalid token' };
      }
      
      return { user: { id: userId }, error: null };
    } catch (e) {
      console.error('[Settings API] Token decode error:', e instanceof Error ? e.message : String(e));
      return { user: null, error: 'Invalid token' };
    }
  } catch (error) {
    console.error('[Settings API] getUserFromRequest error:', error);
    return { user: null, error: 'Unauthorized' };
  }
}

export async function GET() {
  try {
    const { user, error: authError } = await getUserFromRequest();
    if (!user || authError) {
      console.log('[Settings API GET] Auth failed:', { user, authError });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        console.log('[Settings API GET] Missing Supabase config');
        return NextResponse.json({ settings: {} });
      }

      // Use REST API to fetch settings
      const response = await fetch(
        `${supabaseUrl}/rest/v1/UserSettings?userId=eq.${user.id}&select=settings`,
        {
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Settings fetch failed:', response.status);
        return NextResponse.json({ settings: {} });
      }

      const data = await response.json();
      return NextResponse.json({ settings: data[0]?.settings ?? {} });
    } catch (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ settings: {} });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body structure
    const validation = validateRequestBody(body, SETTINGS_SCHEMA);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
    }

    const settings = body.settings || body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
    }

    // First, check if record exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/UserSettings?userId=eq.${user.id}&select=id`,
      {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const existingRecords = await checkResponse.json();
    const exists = Array.isArray(existingRecords) && existingRecords.length > 0;

    let response;
    if (exists) {
      // Update existing record
      response = await fetch(
        `${supabaseUrl}/rest/v1/UserSettings?userId=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
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
        `${supabaseUrl}/rest/v1/UserSettings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
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
      console.error('Settings save failed:', response.status, await response.text());
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
