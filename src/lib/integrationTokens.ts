type RefreshTokenResponse = {
  access_token?: string;
};

export async function getValidToken(userId: string, provider: string): Promise<string | undefined> {
  const res = await fetch("/api/refresh-token", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, provider }),
  });

  const data = (await res.json()) as RefreshTokenResponse;
  return data.access_token;
}

export async function uploadYouTubeVideo(
  userId: string,
  videoPayload: Record<string, unknown>
): Promise<void> {
  const token = await getValidToken(userId, "youtube");

  await fetch("https://www.googleapis.com/upload/youtube/v3/videos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoPayload),
  });
}
