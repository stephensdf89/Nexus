export default async function scheduleTrigger(event = {}) {
  const triggerType = event?.type ?? "";
  const matched = triggerType === "schedule.tick";
  return {
    matched,
    payload: event?.payload ?? {},
    reason: matched ? null : "Trigger type mismatch for Schedule",
  };
}
