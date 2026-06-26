import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth-server";
import { populateGenome } from "@/src/lib/genome/populateGenome";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const card = await prisma.card.create({
    data: {
      userId: user.id,
      title: body.title,
      script: body.script,
      caption: body.caption,
      niche: body.niche,
      platforms: body.platforms || []
    }
  });

  // AI toggle from user settings
  const aiEnabled = false;

  await populateGenome(card, aiEnabled);

  return NextResponse.json({ card });
}



