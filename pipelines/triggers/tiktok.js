export default async function tiktokTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const matched = triggerType === "tiktok.new_follower";
  return {
    matched,
    payload: event?.payload ?? {},
    reason: matched ? null : "Trigger type mismatch for TikTok",
  };
}
