export default async function sendWebhook(input = {}, config = {}) {
  return {
    ok: true,
    endpoint: config.url ?? null,
    method: config.method ?? "POST",
    payload: input,
    provider: "webhook",
  };
}
