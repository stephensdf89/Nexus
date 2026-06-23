import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPgClient } from '@/lib/pg';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  return createClient(url, key);
}

async function getUserFromRequest(req: NextRequest) {
  const accessToken =
    req.cookies.get('sb-access-token')?.value ||
    req.headers.get('x-supabase-auth') ||
    null;

  if (!accessToken) return null;

  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
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
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const settings = body?.settings && typeof body.settings === 'object' ? body.settings : body;

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
