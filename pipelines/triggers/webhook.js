export default async function webhookTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const matched = triggerType === "webhook.received";
  return {
    matched,
    payload: event?.payload ?? {},
    reason: matched ? null : "Trigger type mismatch for Webhook",
  };
}
