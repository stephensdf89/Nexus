const VALID_PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "linkedin",
  "x",
  "threads",
  "bluesky",
  "telegram"
];

export function validatePlatform(platform) {
  return VALID_PLATFORMS.includes(platform);
}
