#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://localhost:3000";
const TIMEOUT_MS = 15000;

const args = process.argv.slice(2);
const baseUrlArgIndex = args.findIndex((arg) => arg === "--base-url");
const baseUrlFromArg =
  baseUrlArgIndex >= 0 ? args[baseUrlArgIndex + 1] : undefined;
const baseUrlRaw =
  baseUrlFromArg || process.env.BASE_URL || process.env.PRODUCTION_BASE_URL || DEFAULT_BASE_URL;
const baseUrl = baseUrlRaw.replace(/\/$/, "");

const checks = [
  { name: "Home", path: "/", expect: [200] },
  { name: "About", path: "/about", expect: [200] },
  { name: "Support", path: "/support", expect: [200] },
  { name: "Terms", path: "/terms", expect: [200] },
  { name: "Privacy", path: "/privacy", expect: [200] },
  { name: "Quick Start Doc", path: "/support/docs/quick-start", expect: [200] },
  { name: "Health API", path: "/api/health", expect: [200], jsonStatus: "ok" },
];

function withTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}

async function runCheck(check) {
  const url = `${baseUrl}${check.path}`;
  const startedAt = Date.now();

  try {
    const res = await withTimeout(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    const durationMs = Date.now() - startedAt;
    const expected = check.expect.includes(res.status);
    if (!expected) {
      return {
        ok: false,
        message: `${check.name}: expected ${check.expect.join(" or ")} but got ${res.status} (${durationMs}ms)`,
      };
    }

    if (check.jsonStatus) {
      const body = await res.json();
      if (body?.status !== check.jsonStatus) {
        return {
          ok: false,
          message: `${check.name}: expected JSON status ${check.jsonStatus} but got ${String(body?.status)} (${durationMs}ms)`,
        };
      }
    }

    return {
      ok: true,
      message: `${check.name}: ${res.status} (${durationMs}ms)`,
    };
  } catch (error) {
    return {
      ok: false,
      message: `${check.name}: request failed (${error instanceof Error ? error.message : String(error)})`,
    };
  }
}

console.log(`Running smoke checks against ${baseUrl}`);
const results = await Promise.all(checks.map((check) => runCheck(check)));

let failures = 0;
for (const result of results) {
  if (result.ok) {
    console.log(`PASS ${result.message}`);
  } else {
    failures += 1;
    console.error(`FAIL ${result.message}`);
  }
}

if (failures > 0) {
  console.error(`Smoke checks failed: ${failures}/${checks.length}`);
  process.exit(1);
}

console.log(`Smoke checks passed: ${checks.length}/${checks.length}`);