import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";
import multiPlatformRepurposer from "@/src/lib/multiPlatformRepurposer";
import { postContent } from "@/src/lib/postpulse";
import { getBestTimeForPlatform } from "@/src/lib/bestTimeEngine";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { platform, startDate } = body;

  if (!platform) {
    return NextResponse.json({ error: "Missing platform" }, { status: 400 });
  }

  if (!startDate) {
    return NextResponse.json({ error: "Missing startDate" }, { status: 400 });
  }

  // Fetch latest 30 cards
  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30
  });

  if (cards.length < 30) {
    return NextResponse.json({ error: "Not enough cards (need 30)" }, { status: 400 });
  }

  // Get platform token
  const token = await prisma.platformToken.findFirst({
    where: { userId: user.id, platform }
  });

  if (!token) {
    return NextResponse.json({ error: "Platform not connected" }, { status: 400 });
  }

  const schedule = [];
  const start = new Date(startDate);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    // Repurpose card
    const repurposed = multiPlatformRepurposer.repurpose({
      script: card.script,
      topic: card.title,
      niche: card.niche,
      vibe: "aggressive"
    });

    const version = repurposed[platform];
    const content = version.caption || card.caption || card.title;
    const media = card.mediaUrl || null;

    // Best time for this platform
    const bestTime = await getBestTimeForPlatform(user.id, platform);

    // Build schedule datetime
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const [hour, minute] = bestTime.split(":");
    date.setHours(parseInt(hour), parseInt(minute), 0);

    // Schedule via PostPulse
    const result = await postContent({
      accessToken: token.accessToken,
      platform,
      content,
      media,
      scheduleFor: date.toISOString()
    });

    schedule.push({
      day: i + 1,
      date: date.toISOString(),
      bestTime,
      cardId: card.id,
      postpulseResponse: result
    });
  }

  return NextResponse.json({ schedule });
}
