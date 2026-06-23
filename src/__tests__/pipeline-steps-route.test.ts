/**
 * @jest-environment node
 */

import { POST } from "@/app/api/pipelines/[id]/steps/route";
import { getServerSession } from "next-auth/next";
import { getPgClient } from "@/lib/pg";
import { requireAccessFromSessionUser } from "@/lib/serverAccess";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/pg", () => ({
  getPgClient: jest.fn(),
}));

jest.mock("@/lib/serverAccess", () => ({
  requireAccessFromSessionUser: jest.fn(),
}));

describe("POST /api/pipelines/[id]/steps", () => {
  const mockGetServerSession = getServerSession as jest.Mock;
  const mockGetPgClient = getPgClient as jest.Mock;
  const mockRequireAccess = requireAccessFromSessionUser as jest.Mock;
  const query = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    query.mockReset();

    mockGetServerSession.mockResolvedValue({
      user: { name: "user-123", email: "user@example.com" },
    });
    mockRequireAccess.mockResolvedValue({ isOwner: false, accessLevel: "pro" });
    mockGetPgClient.mockResolvedValue({ query });
  });

  it("returns 401 when session user is missing", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = new Request("https://example.com/api/pipelines/p1/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps: [] }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when steps array is empty", async () => {
    const req = new Request("https://example.com/api/pipelines/p1/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps: [] }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("steps array is required");
  });

  it("returns 400 and rolls back when step type is invalid", async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes("SELECT id FROM pipelines")) {
        return { rows: [{ id: "p1" }] };
      }
      return { rows: [] };
    });

    const req = new Request("https://example.com/api/pipelines/p1/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: [{ type: "invalid", config: {}, step_order: 1 }],
      }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid step type");
    expect(query).toHaveBeenCalledWith("ROLLBACK");
  });

  it("saves valid steps and commits transaction", async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes("SELECT id FROM pipelines")) {
        return { rows: [{ id: "p1" }] };
      }
      return { rows: [] };
    });

    const req = new Request("https://example.com/api/pipelines/p1/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: [
          { type: "trigger", config: { type: "youtube.new_comment" }, step_order: 1 },
          { type: "action", config: { type: "sendWebhook" }, step_order: 2 },
        ],
      }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ id: "p1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.count).toBe(2);
    expect(query).toHaveBeenCalledWith("COMMIT");
  });
});
