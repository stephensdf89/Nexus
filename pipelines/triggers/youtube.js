export default async function youtubeTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const matched = triggerType.startsWith("youtube.");
  return {
    matched,
    payload: event?.payload ?? {},
    reason: matched ? null : "Trigger type mismatch for YouTube",
  };
}
