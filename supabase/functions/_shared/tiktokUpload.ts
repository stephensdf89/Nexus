export async function tiktokUpload(token, payload) {
  const { fileUrl, caption } = payload;

  const video = await fetch(fileUrl).then((r) => r.arrayBuffer());

  const upload = await fetch("https://open.tiktokapis.com/v2/video/upload/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "video/mp4",
    },
    body: video,
  });

  const data = await upload.json();

  // Then publish
  const publish = await fetch("https://open.tiktokapis.com/v2/video/publish/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_id: data.data.video_id,
      caption,
    }),
  });

  return await publish.json();
}
