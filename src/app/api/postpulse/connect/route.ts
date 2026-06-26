import { NextRequest, NextResponse } from "next/server";
import { validatePlatform } from "@/utils/validatePlatform";
import { getConnectUrl } from "@/lib/postpulse-server";
import { getCurrentUser } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");

  if (!validatePlatform(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = getConnectUrl(platform);
  return NextResponse.redirect(url);
}