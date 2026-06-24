export async function instagramPublish(token, payload) {
  const { imageUrl, caption } = payload;

  const create = await fetch(
    `https://graph.facebook.com/v19.0/me/media?image_url=${encodeURIComponent(
      imageUrl
    )}&caption=${encodeURIComponent(caption)}&access_token=${token}`,
    { method: "POST" }
  );

  const { id } = await create.json();

  const publish = await fetch(
    `https://graph.facebook.com/v19.0/me/media_publish?creation_id=${id}&access_token=${token}`,
    { method: "POST" }
  );

  return await publish.json();
}
