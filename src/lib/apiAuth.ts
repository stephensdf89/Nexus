/**
 * Authentication and authorization validation helpers
 * Centralizes auth patterns across API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { createClient } from '@supabase/supabase-js';
import { validateRequestHeaders } from '@/lib/requestValidation';

export type AuthSession = {
  userId: string;
  email: string;
};

/**
 * Get user from NextAuth session (for routes using NextAuth)
 */
export async function getSessionUser(): Promise<AuthSession | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.name || !session?.user?.email) {
      return null;
    }
    return {
      userId: session.user.name,
      email: session.user.email,
    };
  } catch {
    return null;
  }
}

/**
 * Get user from Supabase token (for API endpoints with bearer token)
 */
export async function getSupabaseUser(token: string): Promise<AuthSession | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;

    const supabase = createClient(url, key);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    return {
      userId: user.id,
      email: user.email || '',
    };
  } catch {
    return null;
  }
}

/**
 * Require NextAuth session (returns error response or user)
 */
export async function requireSession(req: NextRequest): Promise<
  { user: AuthSession; error?: never } | { error: Response; user?: never }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { user };
}

/**
 * Require Supabase auth (returns error response or user)
 */
export async function requireSupabaseAuth(req: NextRequest): Promise<
  { user: AuthSession; error?: never } | { error: Response; user?: never }
> {
  const { valid, token } = validateRequestHeaders(req);
  if (!valid || !token) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = await getSupabaseUser(token);
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { user };
}

/**
 * Create standardized 401 response
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * Create standardized 403 response (no info leakage in prod)
 */
export function forbiddenResponse(reason?: string) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  return NextResponse.json({ error: reason || 'Access denied' }, { status: 403 });
}

/**
 * Create standardized 400 response for invalid input
 */
export function badRequestResponse(message: string) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Create standardized 404 response
 */
export function notFoundResponse(resource: string) {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

/**
 * Create standardized 500 response (never leak error details in prod)
 */
export function serverErrorResponse(error?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Server error:', error);
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
