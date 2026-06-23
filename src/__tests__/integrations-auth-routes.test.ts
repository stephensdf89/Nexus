/**
 * @jest-environment node
 */

import { POST as facebookAuthPost } from "@/app/api/integrations/facebook/auth/route";
import { POST as tiktokAuthPost } from "@/app/api/integrations/tiktok/auth/route";
import { POST as youtubeAuthPost } from "@/app/api/integrations/youtube/auth/route";
import { POST as twitterAuthPost } from "@/app/api/integrations/twitter/auth/route";
import { POST as instagramAuthPost } from "@/app/api/integrations/instagram/auth/route";
import { POST as linkedinAuthPost } from "@/app/api/integrations/linkedin/auth/route";
import { POST as pinterestAuthPost } from "@/app/api/integrations/pinterest/auth/route";
import { POST as twitchAuthPost } from "@/app/api/integrations/twitch/auth/route";

describe("Integration auth POST routes", () => {
  const oldEnv = { ...process.env };

  beforeEach(() => {
    process.env.FACEBOOK_CLIENT_ID = "fb-client";
    process.env.TIKTOK_CLIENT_ID = "tt-client";
    process.env.GOOGLE_CLIENT_ID = "yt-client";
    process.env.TWITTER_CLIENT_ID = "tw-client";
    process.env.INSTAGRAM_APP_ID = "ig-client";
    process.env.LINKEDIN_CLIENT_ID = "li-client";
    process.env.PINTEREST_APP_ID = "pn-client";
    process.env.TWITCH_CLIENT_ID = "twitch-client";
    process.env.NEXTAUTH_URL = "https://example.com";
    process.env.VERCEL_URL = "example.com";
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("facebook auth returns 401 without identity headers", async () => {
    const req = new Request("https://example.com/api/integrations/facebook/auth", {
      method: "POST",
    });

    const res = await facebookAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("facebook auth returns authUrl with identity header", async () => {
    const req = new Request("https://example.com/api/integrations/facebook/auth", {
      method: "POST",
      headers: { "x-user-id": "user-123" },
    });

    const res = await facebookAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(typeof body.authUrl).toBe("string");
    expect(body.authUrl).toContain("facebook.com");
  });

  it("tiktok auth rejects missing identity", async () => {
    const req = new Request("https://example.com/api/integrations/tiktok/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await tiktokAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Missing user identity");
  });

  it("youtube auth returns URL for valid uid", async () => {
    const req = new Request("https://example.com/api/integrations/youtube/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: "user-123" }),
    });

    const res = await youtubeAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.authUrl).toContain("accounts.google.com");
  });

  it("twitter auth rejects invalid json", async () => {
    const req = {
      json: jest.fn().mockRejectedValue(new Error("invalid json")),
    };

    const res = await twitterAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Request validation failed");
  });

  it("instagram auth returns URL with email identity", async () => {
    const req = new Request("https://example.com/api/integrations/instagram/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" }),
    });

    const res = await instagramAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(typeof body.authUrl).toBe("string");
    expect(body.authUrl).toContain("instagram.com");
  });

  it("linkedin auth returns URL with uid identity", async () => {
    const req = new Request("https://example.com/api/integrations/linkedin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: "user-1" }),
    });

    const res = await linkedinAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.authUrl).toContain("linkedin.com");
  });

  it("pinterest auth returns URL with uid identity", async () => {
    const req = new Request("https://example.com/api/integrations/pinterest/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: "user-1" }),
    });

    const res = await pinterestAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.authUrl).toContain("pinterest.com");
  });

  it("twitch auth returns URL with email identity", async () => {
    const req = new Request("https://example.com/api/integrations/twitch/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com" }),
    });

    const res = await twitchAuthPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.authUrl).toContain("twitch.tv");
  });
});
