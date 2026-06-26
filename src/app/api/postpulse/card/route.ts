import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth-server";
import { validatePlatform } from "@/src/utils/validatePlatform";
import { postContent } from "@/src/lib/postpulse-server";
import multiPlatformRepurposer from "@/src/lib/multiPlatformRepurposer";

type CardPostBody = {
  cardId?: string;
  platform?: string;
  scheduleFor?: string;
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as CardPostBody;
  const { cardId, platform, scheduleFor } = body;

  if (!cardId || !platform) {
    return NextResponse.json({ error: "Missing cardId or platform" }, { status: 400 });
  }

  if (!validatePlatform(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const card = await prisma.card.findFirst({
    where: { id: cardId, userId: user.id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const token = await prisma.platformToken.findFirst({
    where: { userId: user.id, platform },
  });

  if (!token) {
    return NextResponse.json({ error: "Platform not connected" }, { status: 400 });
  }

  // Repurpose card script for all platforms, then pick the one we need.
  const repurposed = multiPlatformRepurposer.repurpose({
    script: card.script || "",
    topic: card.title,
    niche: card.niche || "",
    vibe: "aggressive",
  });

  const platformVersion = (repurposed as Record<string, any>)[platform] || {
    caption: card.caption || card.title,
    hook: card.title,
    script: card.script || "",
    title: card.title,
  };

  const content = platformVersion.caption || card.caption || card.title;
  const media = card.mediaUrl || null;

  const result = await postContent({
    accessToken: token.accessToken,
    platform,
    content,
    media,
    scheduleFor,
  });

  return NextResponse.json(result);
}


