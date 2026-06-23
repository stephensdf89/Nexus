export default async function discordTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const matched = triggerType.startsWith("discord.");
  return {
    matched,
    payload: event?.payload ?? {},
    reason: matched ? null : "Trigger type mismatch for Discord",
  };
}
