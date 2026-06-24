import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { user_id, provider } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Load integration record
  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user_id)
    .eq("provider", provider)
    .single();

  if (!integration) {
    return new Response("Integration not found", { status: 404 });
  }

  const now = Date.now();
  const expires = new Date(integration.expires_at).getTime();

  // If token still valid → return it
  if (expires > now + 60_000) {
    return new Response(
      JSON.stringify({ access_token: integration.access_token }),
      { status: 200 }
    );
  }

  // Otherwise refresh it
  const refreshUrl = `https://oauth.${provider}.com/token`;

  const tokenResponse = await fetch(refreshUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get(`${provider.toUpperCase()}_CLIENT_ID`)!,
      client_secret: Deno.env.get(`${provider.toUpperCase()}_CLIENT_SECRET`)!,
      refresh_token: integration.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const tokens = await tokenResponse.json();

  // Save new tokens
  await supabase
    .from("integrations")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? integration.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", integration.id);

  return new Response(
    JSON.stringify({ access_token: tokens.access_token }),
    { status: 200 }
  );
});
