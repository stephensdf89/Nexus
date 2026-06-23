import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPgClient } from '@/lib/pg';
import {
  validateRequestHeaders,
  createValidationErrorResponse,
  validateRequestBody,
  type ValidationSchema,
} from '@/lib/requestValidation';

const SETTINGS_SCHEMA: ValidationSchema = {
  settings: {
    type: 'object',
    required: true,
  },
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

async function getUserFromRequest(req: NextRequest) {
  const { valid, errors, token } = validateRequestHeaders(req);
  if (!valid) {
    return { user: null, error: 'Unauthorized' };
  }

  if (!token) {
    return { user: null, error: 'Unauthorized' };
  }

  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { user: null, error: 'Unauthorized' };
  }

  return { user, error: null };
}

export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(req);
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const db = await getPgClient();
      const result = await db.query(
        `SELECT settings
         FROM public."UserSettings"
         WHERE "userId" = $1
         LIMIT 1`,
        [user.id]
      );

      return NextResponse.json({ settings: result.rows[0]?.settings ?? {} });
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
    const { user, error: authError } = await getUserFromRequest(req);
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body structure
    const validation = validateRequestBody(body, SETTINGS_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const settings = body.settings || body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    const db = await getPgClient();
    await db.query(
      `INSERT INTO public."UserSettings" ("userId", settings, "updatedAt")
       VALUES ($1, $2::jsonb, $3)
       ON CONFLICT ("userId")
       DO UPDATE SET settings = EXCLUDED.settings, "updatedAt" = EXCLUDED."updatedAt"`,
      [user.id, JSON.stringify(settings), new Date().toISOString()]
    );

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
