export async function driveUpload(token, payload) {
  const { fileUrl, name } = payload;

  const file = await fetch(fileUrl).then((r) => r.arrayBuffer());

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: file,
    }
  );

  const fileData = await res.json();

  // Set metadata
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  return fileData;
}
