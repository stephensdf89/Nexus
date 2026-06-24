export default async function gmailTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const payload = event?.payload ?? event ?? {};

  const normalizedPayload = {
    ...payload,
    emailAddress: payload.emailAddress ?? payload.email_address ?? null,
    historyId: payload.historyId ?? payload.history_id ?? null,
  };

  const matched =
    triggerType.startsWith("gmail.") ||
    typeof normalizedPayload.emailAddress === "string" ||
    typeof normalizedPayload.historyId === "string";

  return {
    matched,
    payload: normalizedPayload,
    reason: matched ? null : "Trigger type mismatch for Gmail",
  };
}
