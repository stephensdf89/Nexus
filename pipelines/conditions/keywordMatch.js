export default async function keywordMatch(input = {}, config = {}) {
  const text = String(input.text ?? "").toLowerCase();
  const keywords = Array.isArray(config.keywords)
    ? config.keywords.map((k) => String(k).toLowerCase())
    : [];

  return keywords.some((keyword) => text.includes(keyword));
}
