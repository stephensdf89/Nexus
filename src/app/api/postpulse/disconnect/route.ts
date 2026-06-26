import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { platform?: string };
  const { platform } = body;

  await prisma.platformToken.deleteMany({
    where: { userId: user.id, platform },
  });

  return NextResponse.json({ success: true });
}
