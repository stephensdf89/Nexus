import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth-server";
import viralOptimizer from "@/src/lib/viralOptimizer";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { cardId } = body;

  if (!cardId) {
    return NextResponse.json({ error: "Missing cardId" }, { status: 400 });
  }

  const card = await prisma.card.findFirst({
    where: { id: cardId, userId: user.id }
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const allCards = await prisma.card.findMany({
    where: { userId: user.id }
  });

  // Run the optimizer
  const optimized = viralOptimizer.optimize(card, allCards);

  // Update the card in the DB
  const updated = await prisma.card.update({
    where: { id: cardId },
    data: {
      title: optimized.title,
      script: optimized.script,
      caption: optimized.caption,
      // media stays the same
    }
  });

  return NextResponse.json({
    updated,
    viralPrediction: optimized.viralPrediction,
    thumbnailSuggestions: optimized.thumbnailSuggestions
  });
}



