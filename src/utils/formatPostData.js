export function formatPostData({ content, mediaUrl }) {
  return {
    content: content?.trim() || "",
    media: mediaUrl || null
  };
}
