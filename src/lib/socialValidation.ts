export function detectPlatform(url: string | null | undefined) {
  if (!url) return null;

  const lower = url.toLowerCase();

  if (lower.includes("twitter.com") || lower.startsWith("@")) return "twitter";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";

  return null;
}

export function extractHandle(url: string | null | undefined, platform: string | null | undefined) {
  if (!url) return "";

  // Remove @ if user typed it
  if (url.startsWith("@")) return url.slice(1);

  try {
    const u = new URL(url);

    switch (platform) {
      case "twitter":
      case "instagram":
      case "tiktok":
        return u.pathname.replace("/", "");
      case "youtube":
        return u.pathname.replace("/channel/", "").replace("/", "");
      default:
        return "";
    }
  } catch {
    return "";
  }
}

export function validateSocial(url: string | null | undefined, platform: string | null | undefined) {
  if (!platform) return false;

  const handle = extractHandle(url, platform);
  return handle.length > 0;
}

export async function fetchTwitterMeta(handle: string) {
  try {
    const res = await fetch(`https://unavatar.io/twitter/${handle}`);
    return res.ok ? res.url : null;
  } catch {
    return null;
  }
}

export async function fetchInstagramMeta(handle: string) {
  try {
    const res = await fetch(`https://unavatar.io/instagram/${handle}`);
    return res.ok ? res.url : null;
  } catch {
    return null;
  }
}

export async function fetchTikTokMeta(handle: string) {
  try {
    const res = await fetch(`https://unavatar.io/tiktok/${handle}`);
    return res.ok ? res.url : null;
  } catch {
    return null;
  }
}
