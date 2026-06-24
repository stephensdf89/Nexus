import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const provider = url.searchParams.get("provider");
  const userId = url.searchParams.get("state"); // we pass userId in state

  if (!code || !provider || !userId) {
    return new Response("Missing parameters", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Exchange code for tokens
  const tokenResponse = await fetch(`https://oauth.${provider}.com/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: Deno.env.get(`${provider.toUpperCase()}_CLIENT_ID`)!,
      client_secret: Deno.env.get(`${provider.toUpperCase()}_CLIENT_SECRET`)!,
      redirect_uri: `${Deno.env.get("PUBLIC_URL")}/oauth/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();

  // Store tokens
  await supabase.from("integrations").upsert({
    user_id: userId,
    provider,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    scope: tokens.scope,
  });

  return Response.redirect(`${Deno.env.get("PUBLIC_URL")}/settings/integrations`);
});
