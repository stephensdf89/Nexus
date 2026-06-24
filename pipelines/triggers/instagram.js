export default async function instagramTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const objectType = event?.object ?? "";
  const entry = Array.isArray(event?.entry) ? event.entry : [];

  const messaging = entry.flatMap((item) => item?.messaging ?? []);
  const normalizedPayload = {
    ...event?.payload,
    entry,
    messaging,
    senderId: messaging[0]?.sender?.id ?? null,
    messageText: messaging[0]?.message?.text ?? null,
  };

  const matched =
    triggerType.startsWith("instagram.") ||
    objectType === "instagram" ||
    messaging.length > 0;

  return {
    matched,
    payload: normalizedPayload,
    reason: matched ? null : "Trigger type mismatch for Instagram",
  };
}
