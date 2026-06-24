import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getValidToken } from "../_shared/getValidToken";
import { youtubeUpload } from "../_shared/youtubeUpload";
import { tiktokUpload } from "../_shared/tiktokUpload";
import { instagramPublish } from "../_shared/instagramPublish";
import { twitterPost } from "../_shared/twitterPost";
import { driveUpload } from "../_shared/driveUpload";
import { gmailSend } from "../_shared/gmailSend";

serve(async (req) => {
  try {
    const { userId, provider, action, payload } = await req.json();

    if (!userId || !provider) {
      return new Response("Missing parameters", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = await getValidToken(userId, provider, supabase);

    let result: unknown;

    switch (provider) {
      case "youtube":
        result = await youtubeUpload(token, payload);
        break;

      case "tiktok":
        result = await tiktokUpload(token, payload);
        break;

      case "instagram":
        result = await instagramPublish(token, payload);
        break;

      case "twitter":
        result = await twitterPost(token, payload);
        break;

      case "google":
        if (action === "drive.upload") {
          result = await driveUpload(token, payload);
          break;
        }

        if (action === "gmail.send") {
          result = await gmailSend(token, payload);
          break;
        }

        return new Response("Unknown google action", { status: 400 });

      default:
        return new Response("Unknown provider", { status: 400 });
    }

    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("execute-integration-action failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
