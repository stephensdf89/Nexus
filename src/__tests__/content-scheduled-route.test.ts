/**
 * @jest-environment node
 */

import { POST } from "@/app/api/content/scheduled/route";
import { getPgClient } from "@/lib/pg";

jest.mock("@/lib/pg", () => ({
  getPgClient: jest.fn(),
}));

describe("POST /api/content/scheduled", () => {
  const mockGetPgClient = getPgClient as jest.Mock;
  const query = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    query.mockReset();
    mockGetPgClient.mockResolvedValue({ query });
  });

  it("returns 401 when identity headers are missing", async () => {
    const req = new Request("https://example.com/api/content/scheduled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 for invalid platform", async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const req = new Request("https://example.com/api/content/scheduled", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user-123",
      },
      body: JSON.stringify({
        platforms: ["invalid-platform"],
        content: "Hello world",
        scheduled_time: future,
      }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid platform in request");
  });

  it("returns 400 for invalid scheduled_time", async () => {
    const req = new Request("https://example.com/api/content/scheduled", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": "user@example.com",
      },
      body: JSON.stringify({
        platforms: ["youtube"],
        content: "Hello world",
        scheduled_time: "not-a-date",
      }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid scheduled_time");
  });

  it("creates a scheduled post for valid payload", async () => {
    const future = new Date(Date.now() + 120_000).toISOString();

    query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "post-1",
            platforms: ["youtube"],
            content: "Scheduled post",
            media_urls: [],
            scheduled_time: future,
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ],
      });

    const req = new Request("https://example.com/api/content/scheduled", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user-123",
      },
      body: JSON.stringify({
        platforms: ["youtube"],
        content: "Scheduled post",
        media_urls: [],
        scheduled_time: future,
      }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.scheduled_post.id).toBe("post-1");
    expect(query).toHaveBeenCalledTimes(2);
  });
});
