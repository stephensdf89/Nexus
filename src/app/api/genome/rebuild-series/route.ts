import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { assignSeries } from "@/src/lib/genome/assignSeries";
import { getCurrentUser } from "@/src/lib/auth-server";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await prisma.card.findMany({
    where: { userId: user.id }
  });

  for (const card of cards) {
    const genome = await prisma.contentGenome.findUnique({
      where: { cardId: card.id }
    });

    if (genome) {
      await assignSeries(card, genome, false);
    }
  }

  return NextResponse.json({ status: "Series rebuilt" });
}



