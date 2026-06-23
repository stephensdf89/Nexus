import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platformId } = await req.json();

    if (!platformId) {
      return NextResponse.json({ error: "Missing platformId" }, { status: 400 });
    }

    // Delete the integration from database
    const pg = await getPgClient();
    await pg.query(
      `DELETE FROM integrations 
       WHERE user_email = $1 AND platform = 'facebook' AND platform_id = $2`,
      [session.user.email, platformId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Facebook:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Facebook" },
      { status: 500 }
    );
  }
}
