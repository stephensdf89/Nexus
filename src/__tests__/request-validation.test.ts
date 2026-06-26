/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import {
  createValidationErrorResponse,
  validateRequestBody,
  validateRequestHeaders,
  type ValidationSchema,
} from "@/lib/requestValidation";

describe("requestValidation", () => {
  const schema: ValidationSchema = {
    name: { type: "string", required: true, minLength: 2 },
    mode: { type: "string", required: true, enum: ["standard", "strict"] },
    count: { type: "number", required: false, min: 1, max: 10 },
  };

  it("accepts valid payload", () => {
    const result = validateRequestBody(
      { name: "Creator", mode: "standard", count: 3 },
      schema
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toEqual({ name: "Creator", mode: "standard", count: 3 });
  });

  it("rejects missing required fields", () => {
    const result = validateRequestBody({ mode: "standard" }, schema);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "name")).toBe(true);
  });

  it("rejects invalid enum values", () => {
    const result = validateRequestBody(
      { name: "Creator", mode: "creative" },
      schema
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "mode")).toBe(true);
  });

  it("reads token from x-supabase-auth header", () => {
    const req = new NextRequest("https://example.com/api/test", {
      headers: { "x-supabase-auth": "test-token-123" },
    });

    const result = validateRequestHeaders(req);

    expect(result.valid).toBe(true);
    expect(result.token).toBe("test-token-123");
    expect(result.errors).toHaveLength(0);
  });

  it("returns detailed validation errors in development", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    const response = createValidationErrorResponse([
      { field: "name", message: "name is required" },
    ]);

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Request validation failed");
    expect(json.details).toContain("name: name is required");

    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
  });

  it("returns generic validation errors in production", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";

    const response = createValidationErrorResponse([
      { field: "name", message: "name is required" },
    ]);

    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "Request validation failed" });

    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
  });
});
