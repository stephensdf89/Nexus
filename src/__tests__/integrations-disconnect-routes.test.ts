/**
 * @jest-environment node
 */

import { getPgClient } from "@/lib/pg";
import { POST as facebookDisconnectPost } from "@/app/api/integrations/facebook/disconnect/route";
import { POST as instagramDisconnectPost } from "@/app/api/integrations/instagram/disconnect/route";
import { POST as linkedinDisconnectPost } from "@/app/api/integrations/linkedin/disconnect/route";
import { POST as pinterestDisconnectPost } from "@/app/api/integrations/pinterest/disconnect/route";
import { POST as tiktokDisconnectPost } from "@/app/api/integrations/tiktok/disconnect/route";
import { POST as twitchDisconnectPost } from "@/app/api/integrations/twitch/disconnect/route";
import { POST as twitterDisconnectPost } from "@/app/api/integrations/twitter/disconnect/route";
import { POST as youtubeDisconnectPost } from "@/app/api/integrations/youtube/disconnect/route";

jest.mock("@/lib/pg", () => ({
  getPgClient: jest.fn(),
}));

describe("Integration disconnect POST routes", () => {
  const mockGetPgClient = getPgClient as jest.Mock;
  const query = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    query.mockReset();
    query.mockResolvedValue({ rows: [] });
    mockGetPgClient.mockResolvedValue({ query });
  });

  it("facebook disconnect rejects missing identity", async () => {
    const req = new Request("https://example.com/api/integrations/facebook/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platformId: "page-1" }),
    });

    const res = await facebookDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("facebook disconnect requires platformId", async () => {
    const req = new Request("https://example.com/api/integrations/facebook/disconnect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "550e8400-e29b-41d4-a716-446655440000",
      },
      body: JSON.stringify({}),
    });

    const res = await facebookDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Request validation failed");
  });

  it("facebook disconnect succeeds with valid payload", async () => {
    const req = new Request("https://example.com/api/integrations/facebook/disconnect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "550e8400-e29b-41d4-a716-446655440000",
      },
      body: JSON.stringify({ platformId: "page-1" }),
    });

    const res = await facebookDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("instagram disconnect succeeds with identity header", async () => {
    const req = new Request("https://example.com/api/integrations/instagram/disconnect", {
      method: "POST",
      headers: { "x-user-id": "user-1" },
    });

    const res = await instagramDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("linkedin disconnect succeeds with identity header", async () => {
    const req = new Request("https://example.com/api/integrations/linkedin/disconnect", {
      method: "POST",
      headers: { "x-user-email": "user@example.com" },
    });

    const res = await linkedinDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("pinterest disconnect succeeds with identity header", async () => {
    const req = new Request("https://example.com/api/integrations/pinterest/disconnect", {
      method: "POST",
      headers: { "x-user-id": "user-1" },
    });

    const res = await pinterestDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("tiktok disconnect succeeds with identity header", async () => {
    const req = new Request("https://example.com/api/integrations/tiktok/disconnect", {
      method: "POST",
      headers: { "x-user-email": "user@example.com" },
    });

    const res = await tiktokDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("twitch disconnect succeeds with identity header", async () => {
    const req = new Request("https://example.com/api/integrations/twitch/disconnect", {
      method: "POST",
      headers: { "x-user-id": "user-1" },
    });

    const res = await twitchDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("twitter disconnect succeeds with identity header", async () => {
    const req = new Request("https://example.com/api/integrations/twitter/disconnect", {
      method: "POST",
      headers: { "x-user-email": "user@example.com" },
    });

    const res = await twitterDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("youtube disconnect succeeds with identity header", async () => {
    const req = new Request("https://example.com/api/integrations/youtube/disconnect", {
      method: "POST",
      headers: { "x-user-id": "user-1" },
    });

    const res = await youtubeDisconnectPost(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
