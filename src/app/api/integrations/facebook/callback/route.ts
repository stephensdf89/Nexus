import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_APP_ID = process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

function getAppBaseUrl(req: NextRequest) {
  const configuredBase =
    process.env.FACEBOOK_APP_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.SITE_URL ||
    process.env.URL;

  if (configuredBase) {
    return configuredBase.replace(/\/+$/, "");
  }

  return req.nextUrl.origin;
}

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getFacebookRedirectUri(req: NextRequest) {
  if (process.env.FACEBOOK_REDIRECT_URI) {
    return process.env.FACEBOOK_REDIRECT_URI;
  }

  return `${getAppBaseUrl(req)}/api/integrations/facebook/callback`;
}

function withFacebookCookies(
  response: NextResponse,
  payload: {
    platformId: string;
    pageName: string;
    accessToken: string;
    pageAccessToken: string | null;
  }
) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set("fb_platform_id", payload.platformId, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set("fb_page_name", payload.pageName, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set("fb_access_token", payload.accessToken, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set("fb_page_access_token", payload.pageAccessToken || "", {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

async function upsertIntegration(params: {
  userId?: string;
  email?: string;
  platformId: string;
  pageName: string;
  accessToken: string;
  pageAccessToken: string | null;
}) {
  const { userId, email, platformId, pageName, accessToken, pageAccessToken } = params;

  // Try with service role key via REST API if available
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) throw new Error("supabase_url_missing");

  const record: Record<string, unknown> = {
    platform: "facebook",
    platform_id: platformId,
    page_name: pageName,
    access_token: accessToken,
    page_access_token: pageAccessToken,
    updated_at: new Date().toISOString(),
  };

  const matchColumn = isUuid(userId) ? "user_id" : "user_email";
  const matchValue = isUuid(userId) ? userId : email;

  if (!matchValue) {
    throw new Error("missing_identity_for_fallback");
  }

  if (isUuid(userId)) {
    record.user_id = userId;
  } else {
    record.user_email = email;
  }

  // Try REST API with service role key if available
  if (serviceRoleKey) {
    try {
      // Check if record exists
      const checkUrl = new URL(
        `${supabaseUrl}/rest/v1/integrations?${matchColumn}=eq.${encodeURIComponent(matchValue as string)}&platform=eq.facebook`
      );
      const checkRes = await fetch(checkUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      });

      const existing = await checkRes.json();

      if (Array.isArray(existing) && existing.length > 0) {
        // Update
        const updateUrl = new URL(`${supabaseUrl}/rest/v1/integrations?id=eq.${existing[0].id}`);
        await fetch(updateUrl.toString(), {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(record),
        });
      } else {
        // Insert
        const insertUrl = new URL(`${supabaseUrl}/rest/v1/integrations`);
        await fetch(insertUrl.toString(), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(record),
        });
      }
      return;
    } catch (err) {
      console.error("REST API upsert failed, will fall back to cookie-only", err);
    }
  }

  // If we get here, service role key wasn't available or failed
  // The integration is already stored in cookies, so this is acceptable
  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not available; integration stored in cookies only");
  }
}

export async function GET(req: NextRequest) {
  try {
    const appBaseUrl = getAppBaseUrl(req);

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=facebook_config_missing", appBaseUrl));
    }

    const cookieUserId = req.cookies.get("fb_user_id")?.value;
    const cookieEmail = req.cookies.get("fb_user_email")?.value;
    const email = cookieEmail;

    // Get code and state from query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Verify state matches cookie
    const storedState = req.cookies.get("fb_oauth_state")?.value;
    if (!state || state !== storedState) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=state_mismatch", appBaseUrl));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/settings?tab=connected&error=no_code", appBaseUrl));
    }

    const redirectUri = getFacebookRedirectUri(req);

    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
    tokenUrl.searchParams.set("client_secret", FACEBOOK_APP_SECRET);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      console.error("Facebook token error:", tokenData.error);
      const reason = tokenData?.error?.code || tokenResponse.status || "unknown";
      const message = encodeURIComponent(String(tokenData?.error?.message || tokenResponse.statusText || "token_exchange_failed"));
      return NextResponse.redirect(
        new URL(`/settings?tab=connected&error=token_failed&reason=${reason}&message=${message}`, appBaseUrl)
      );
    }

    // Try to fetch pages when page scopes are granted.
    // If page scopes are unavailable, fall back to basic profile so connect still works.
    let platformId = "";
    let pageName = "";
    let pageAccessToken: string | null = null;

    const pagesResponse = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${tokenData.access_token}`
    );
    const pagesData = await pagesResponse.json();

    if (Array.isArray(pagesData?.data) && pagesData.data.length > 0) {
      platformId = String(pagesData.data[0]?.id || "");
      pageName = String(pagesData.data[0]?.name || "Facebook Page");
      pageAccessToken = pagesData.data[0]?.access_token ? String(pagesData.data[0].access_token) : null;
    } else {
      const meResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name&access_token=${encodeURIComponent(tokenData.access_token)}`
      );
      const meData = await meResponse.json();
      platformId = String(meData?.id || "");
      pageName = String(meData?.name || "Facebook Account");
    }
    // Store integration in database when available.
    // If DATABASE_URL/DNS is broken, continue with cookie-backed connection state.
    const userId = isUuid(cookieUserId) ? cookieUserId : undefined;
    let storageWarning = "";
    try {
      if (!userId && !email) {
        storageWarning = "&warning=missing_identity";
      } else {
        await upsertIntegration({
          userId,
          email,
          platformId,
          pageName,
          accessToken: tokenData.access_token,
          pageAccessToken,
        });
      }
    } catch (storageError) {
      console.error("Facebook callback storage warning:", storageError);
      const message = (storageError as { message?: string }).message || "storage_fallback";
      storageWarning = `&warning=${encodeURIComponent(message)}`;
    }

    // Redirect with success and store secure cookie fallback for analytics/status.
    // Also clear the state cookie so a browser replay of this callback URL fails the state check.
    const response = NextResponse.redirect(
      new URL(`/settings?tab=connected&platform=facebook&status=connected${storageWarning}`, appBaseUrl)
    );
    response.cookies.set("fb_oauth_state", "", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
    withFacebookCookies(response, {
      platformId,
      pageName,
      accessToken: tokenData.access_token,
      pageAccessToken,
    });
    return response;
  } catch (error) {
    console.error("Facebook callback error:", error);
    const code = (error as { code?: string }).code;
    const message = (error as { message?: string }).message || "callback_failed";
    const reason = /missing_identity/i.test(message)
      ? "missing_identity"
      : /supabase_admin_unavailable/i.test(message)
        ? "db_config_missing"
        : "callback_failed";
    return NextResponse.redirect(
      new URL(
        `/settings?tab=connected&error=server_error&reason=${reason}&message=${encodeURIComponent(message)}`,
        getAppBaseUrl(req)
      )
    );
  }
}
