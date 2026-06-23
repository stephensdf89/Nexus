export default async function sendDiscord(input = {}, config = {}) {
  return {
    ok: true,
    channelId: config.channelId ?? null,
    message: config.message ?? input.message ?? "",
    provider: "discord",
  };
}
