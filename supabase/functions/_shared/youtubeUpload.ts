export async function youtubeUpload(token, payload) {
  const { title, description, fileUrl } = payload;

  const video = await fetch(fileUrl).then((r) => r.arrayBuffer());

  const upload = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: { title, description },
        status: { privacyStatus: "public" },
      }),
    }
  );

  const uploadUrl = upload.headers.get("location");

  const final = await fetch(uploadUrl!, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4" },
    body: video,
  });

  return await final.json();
}
