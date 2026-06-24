import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function getValidToken(
  userId: string,
  provider: string,
  supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )
): Promise<string> {
  const { data: integration, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!integration) {
    throw new Error(`Integration not found for provider: ${provider}`);
  }

  const expiresAt = integration.expires_at ? new Date(integration.expires_at).getTime() : 0;
  const now = Date.now();

  if (integration.access_token && expiresAt > now + 60_000) {
    return integration.access_token;
  }

  if (!integration.refresh_token) {
    throw new Error(`Missing refresh token for provider: ${provider}`);
  }

  const tokenUrl = new URL("https://oauth2.googleapis.com/token");
  const clientId = Deno.env.get(`${provider.toUpperCase()}_CLIENT_ID`);
  const clientSecret = Deno.env.get(`${provider.toUpperCase()}_CLIENT_SECRET`);

  if (!clientId || !clientSecret) {
    throw new Error(`OAuth credentials not configured for provider: ${provider}`);
  }

  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("refresh_token", integration.refresh_token);
  tokenUrl.searchParams.set("grant_type", "refresh_token");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed for provider: ${provider}`);
  }

  const tokens = await response.json();
  const accessToken = tokens.access_token as string | undefined;
  const refreshToken = (tokens.refresh_token as string | undefined) ?? integration.refresh_token;
  const expiresIn = Number(tokens.expires_in || 3600);
  const nextExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  await supabase
    .from("integrations")
    .update({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: nextExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", integration.id);

  if (!accessToken) {
    throw new Error(`Missing access token in refresh response for provider: ${provider}`);
  }

  return accessToken;
}
