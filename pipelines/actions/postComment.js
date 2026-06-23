export default async function postComment(input = {}, config = {}) {
  return {
    ok: true,
    platform: config.platform ?? "unknown",
    postId: config.postId ?? null,
    comment: config.comment ?? input.comment ?? "",
  };
}
