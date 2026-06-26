const BASE_URL = "https://api.postpulse.io";

export async function exchangeCodeForToken(code) {
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.POSTPULSE_CLIENT_ID,
      client_secret: process.env.POSTPULSE_CLIENT_SECRET,
      code,
      redirect_uri: process.env.POSTPULSE_REDIRECT
    })
  });

  if (!res.ok) throw new Error("Failed to exchange code for token");
  return res.json();
}

export function getConnectUrl(platform) {
  const params = new URLSearchParams({
    client_id: process.env.POSTPULSE_CLIENT_ID,
    platform,
    redirect_uri: process.env.POSTPULSE_REDIRECT
  });

  return `${BASE_URL}/oauth/authorize?${params.toString()}`;
}

export async function postContent({ accessToken, platform, content, media, scheduleFor }) {
  const res = await fetch(`${BASE_URL}/post`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      platform,
      content,
      media,
      schedule_for: scheduleFor || null
    })
  });

  if (!res.ok) throw new Error("Failed to post content");
  return res.json();
}

export async function getAnalytics({ accessToken, postId }) {
  const res = await fetch(`${BASE_URL}/analytics/${postId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
