/**
 * @jest-environment node
 */

import { POST } from "@/app/api/signup/route";
import { users } from "@/lib/userStore";

describe("POST /api/signup", () => {
  const initialLength = users.length;

  afterEach(() => {
    users.splice(initialLength);
  });

  it("rejects invalid payload", async () => {
    const req = new Request("https://example.com/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "missing-fields@example.com" }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Request validation failed");
  });

  it("rejects invalid email format", async () => {
    const req = new Request("https://example.com/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        username: "testuser",
        email: "not-an-email",
        password: "Password123!",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Request validation failed");
  });

  it("rejects duplicate email", async () => {
    const req = new Request("https://example.com/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Dup User",
        username: "dupuser",
        email: "stephensdf89@gmail.com",
        password: "Password123!",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Email already exists");
  });

  it("creates a new user with hashed password", async () => {
    const req = new Request("https://example.com/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New Creator",
        username: "newcreator",
        email: "newcreator@example.com",
        password: "Password123!",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    const created = users.find((u) => u.email === "newcreator@example.com");
    expect(created).toBeDefined();
    expect(created?.password).toBeDefined();
    expect(created?.password).not.toBe("Password123!");
    expect(created?.password.startsWith("$2")).toBe(true);
  });
});
