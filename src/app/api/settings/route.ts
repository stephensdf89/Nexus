import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { user: null, error: 'Unauthorized' };
    }
    return { user: { id: session.user.id }, error: null };
  } catch (error) {
    return { user: null, error: 'Unauthorized' };
  }
}

export async function GET() {
  try {
    const { user, error: authError } = await getUserFromRequest();
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
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
