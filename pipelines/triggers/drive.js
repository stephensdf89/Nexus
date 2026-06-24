export default async function driveTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const payload = event?.payload ?? event ?? {};
  const kind = payload.kind ?? event?.kind ?? "";

  const normalizedPayload = {
    ...payload,
    kind,
    fileId: payload.fileId ?? payload.file_id ?? null,
  };

  const matched =
    triggerType.startsWith("drive.") ||
    kind === "drive#change" ||
    typeof normalizedPayload.fileId === "string";

  return {
    matched,
    payload: normalizedPayload,
    reason: matched ? null : "Trigger type mismatch for Drive",
  };
}
