import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

function isUuid(value?: string) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

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
    let userId = (session.user as { id?: string }).id;

    if (!isUuid(userId)) {
      const userLookup = await pg.query(
        "SELECT id FROM auth.users WHERE email = $1 LIMIT 1",
        [session.user.email]
      );
      userId = userLookup.rows[0]?.id;
    }

    if (!isUuid(userId)) {
      return NextResponse.json({ error: "Missing user id in session" }, { status: 400 });
    }

    await pg.query(
      `DELETE FROM integrations 
       WHERE user_id = $1 AND platform = 'facebook' AND platform_id = $2`,
      [userId, platformId]
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
