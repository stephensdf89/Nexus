import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";
import { validatePlatform } from "@/src/utils/validatePlatform";
import { formatPostData } from "@/src/utils/formatPostData";
import { postContent } from "@/src/lib/postpulse";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { platform, content, mediaUrl, scheduleFor } = body;

  if (!validatePlatform(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const token = await prisma.platformToken.findFirst({
    where: { userId: user.id, platform }
  });

  if (!token) {
    return NextResponse.json({ error: "Platform not connected" }, { status: 400 });
  }

  const formatted = formatPostData({ content, mediaUrl });

  const result = await postContent({
    accessToken: token.accessToken,
    platform,
    content: formatted.content,
    media: formatted.media,
    scheduleFor
  });

  return NextResponse.json(result);
}