import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth-server";
import viralPredictor from "@/src/lib/viralPredictor";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cardId = searchParams.get("cardId");

  if (!cardId) {
    return NextResponse.json({ error: "Missing cardId" }, { status: 400 });
  }

  const card = await prisma.card.findFirst({
    where: { id: cardId, userId: user.id },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const allCards = await prisma.card.findMany({
    where: { userId: user.id },
  });

  const score = viralPredictor.predict(card, allCards);

  return NextResponse.json(score);
}


