export async function getValidToken(userId, provider) {
  const res = await fetch("/api/refresh-token", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, provider }),
  });

  const data = await res.json();
  return data.access_token;
}

export async function uploadYouTubeVideo(userId, videoPayload) {
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
