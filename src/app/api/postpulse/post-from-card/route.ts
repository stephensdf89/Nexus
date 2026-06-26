import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const headers = new Headers();
  const copyHeaders = ["content-type", "x-user-id", "x-user-email", "x-supabase-auth", "authorization"];
  for (const name of copyHeaders) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  const response = await fetch(new URL("/api/postpulse/card", req.nextUrl.origin), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  return NextResponse.json(data, { status: response.status });
}


