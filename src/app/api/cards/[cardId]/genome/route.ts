import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cardId } = await params;

  const card = await prisma.card.findFirst({
    where: { id: cardId, userId: user.id }
  });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const genome = await prisma.contentGenome.findUnique({
    where: { cardId }
  });

  return NextResponse.json({ card, genome });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cardId } = await params;
  const body = await req.json();

  const card = await prisma.card.findFirst({
    where: { id: cardId, userId: user.id }
  });
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  const data = {
    cardId,
    formatType: body.formatType || null,
    contentType: body.contentType || null,
    platformSuitability: body.platformSuitability || null,
    lengthCategory: body.lengthCategory || null,
    tone: body.tone || null,
    ctaType: body.ctaType || null,
    topicCategory: body.topicCategory || null,
    subTopicCategory: body.subTopicCategory || null,
    seriesId: body.seriesId || null,
    clusterId: body.clusterId || null,
    hookType: body.hookType || null,
    openingPattern: body.openingPattern || null,
    pacingPattern: body.pacingPattern || null,
    valueType: body.valueType || null,
    emotionProfile: body.emotionProfile || null
    // performance + strategic fields can be set by other processes
  };

  const genome = await prisma.contentGenome.upsert({
    where: { cardId },
    update: data,
    create: data
  });

  return NextResponse.json({ genome });
}

