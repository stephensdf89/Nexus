import { NextResponse } from "next/server";
import prisma from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";
import { buildUniverseGraph } from "@/src/lib/contentUniverseEngine";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await prisma.card.findMany({
    where: { userId: user.id }
  });

  const graph = buildUniverseGraph(cards);

  return NextResponse.json(graph);
}
