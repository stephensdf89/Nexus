import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { calculateGrowthPrediction } from "@/src/lib/genome/growthPrediction";
import { getCurrentUser } from "@/src/lib/auth-server";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await prisma.card.findMany({
    where: { userId: user.id }
  });

  for (const card of cards) {
    await calculateGrowthPrediction(card.id);
  }

  return NextResponse.json({ status: "Growth predictions recalculated" });
}



