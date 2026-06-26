import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { validatePlatform } from "@/utils/validatePlatform";
import { formatPostData } from "@/utils/formatPostData";
import { postContent } from "@/lib/postpulse-server";

type ScheduleBody = {
  platform?: string;
  content?: string;
  mediaUrl?: string;
  media?: string;
  scheduleFor?: string;
  schedule_for?: string;
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as ScheduleBody;
  const { platform, content, mediaUrl, media, scheduleFor, schedule_for } = body;
  const resolvedScheduleFor = scheduleFor || schedule_for;

  if (!validatePlatform(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  if (!resolvedScheduleFor) {
    return NextResponse.json({ error: "Missing scheduleFor" }, { status: 400 });
  }

  const token = await prisma.platformToken.findFirst({
    where: { userId: user.id, platform },
  });

  if (!token) {
    return NextResponse.json({ error: "Platform not connected" }, { status: 400 });
  }

  const formatted = formatPostData({ content, mediaUrl: mediaUrl || media });

  const result = await postContent({
    accessToken: token.accessToken,
    platform,
    content: formatted.content,
    media: formatted.media,
    scheduleFor: resolvedScheduleFor,
  });

  return NextResponse.json(result);
}


