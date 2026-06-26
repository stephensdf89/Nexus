import { supabase } from "@/lib/supabaseClient";

type PublishViaPostPulseInput = {
  userId?: string;
  platform: string;
  content: string;
  media?: string | null;
  mediaUrl?: string | null;
  schedule_for?: string | null;
  scheduleFor?: string | null;
};

export async function publishViaPostPulse(input: PublishViaPostPulseInput) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const sessionUserId = sessionData.session?.user?.id;
  const sessionUserEmail = sessionData.session?.user?.email;

  const userId = (input.userId || sessionUserId || "").trim();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userId) {
    headers["x-user-id"] = userId;
  }

  if (sessionUserEmail) {
    headers["x-user-email"] = sessionUserEmail;
  }

  if (accessToken) {
    headers["x-supabase-auth"] = accessToken;
  }

  const response = await fetch("/api/postpulse/post", {
    method: "POST",
    headers,
    body: JSON.stringify({
      userId,
      platform: input.platform,
      content: input.content,
      media: input.media,
      mediaUrl: input.mediaUrl,
      schedule_for: input.schedule_for || input.scheduleFor,
    }),
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    const errorMessage =
      (payload && typeof payload === "object" && "error" in payload && String(payload.error)) ||
      "PostPulse publish failed";
    throw new Error(errorMessage);
  }

  return payload;
}

type FetchPostPulseAnalyticsInput = {
  userId?: string;
  postId: string;
  platform?: string;
};

export async function fetchPostPulseAnalytics(input: FetchPostPulseAnalyticsInput) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const sessionUserId = sessionData.session?.user?.id;
  const sessionUserEmail = sessionData.session?.user?.email;

  const userId = (input.userId || sessionUserId || "").trim();
  const postId = String(input.postId || "").trim();

  if (!postId) {
    throw new Error("postId is required");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userId) {
    headers["x-user-id"] = userId;
  }

  if (sessionUserEmail) {
    headers["x-user-email"] = sessionUserEmail;
  }

  if (accessToken) {
    headers["x-supabase-auth"] = accessToken;
  }

  const analyticsUrl = `/api/postpulse/analytics/${encodeURIComponent(postId)}${
    input.platform ? `?platform=${encodeURIComponent(input.platform)}` : ""
  }`;

  const response = await fetch(analyticsUrl, {
    method: "GET",
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    const errorMessage =
      (payload && typeof payload === "object" && "error" in payload && String(payload.error)) ||
      "PostPulse analytics fetch failed";
    throw new Error(errorMessage);
  }

  return payload;
}