export default async function youtubeTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const eventName = event?.event ?? "";
  const rawPayload = event?.payload ?? event ?? {};
  const normalizedPayload = {
    ...rawPayload,
    videoId: rawPayload.videoId ?? rawPayload.video_id,
    commentText: rawPayload.commentText ?? rawPayload.comment_text,
    userId: rawPayload.userId ?? rawPayload.user_id,
  };
  const matched =
    triggerType === "youtube.new_video" ||
    eventName === "comment.add" ||
    (triggerType === "" &&
      typeof normalizedPayload.channelId === "string" &&
      typeof normalizedPayload.videoId === "string" &&
      typeof normalizedPayload.publishedAt === "string");
  return {
    matched,
    payload: normalizedPayload,
    reason: matched ? null : "Trigger type mismatch for YouTube",
  };
}
