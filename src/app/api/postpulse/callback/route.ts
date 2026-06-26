import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { exchangeCodeForToken } from "@/src/lib/postpulse";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await exchangeCodeForToken(code);

  await prisma.platformToken.upsert({
    where: {
      userId_platform: {
        userId: user.id,
        platform: data.platform
      }
    },
    update: {
      postpulseAccountId: data.account_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    },
    create: {
      userId: user.id,
      platform: data.platform,
      postpulseAccountId: data.account_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000)
    }
  });

  return NextResponse.redirect("/dashboard?connected=1");
}
