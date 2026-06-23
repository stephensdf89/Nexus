import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userEmail = req.headers.get("x-user-email");

  if (!userId && !userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pg = await getPgClient();

    // Create table if it doesn't exist
    await pg.query(`
      CREATE TABLE IF NOT EXISTS scheduled_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        user_email VARCHAR,
        platforms TEXT[] NOT NULL,
        content TEXT NOT NULL,
        media_urls TEXT[],
        scheduled_time TIMESTAMP NOT NULL,
        status VARCHAR DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Fetch scheduled posts for user
    let query = `
      SELECT id, platforms, content, media_urls, scheduled_time, status, created_at
      FROM scheduled_posts
      WHERE scheduled_time > NOW()
    `;

    const params: any[] = [];

    if (userId) {
      query += ` AND user_id = $${params.length + 1}`;
      params.push(userId);
    } else if (userEmail) {
      query += ` AND user_email = $${params.length + 1}`;
      params.push(userEmail);
    }

    query += ` ORDER BY scheduled_time ASC LIMIT 50`;

    const result = await pg.query(query, params);

    return NextResponse.json({
      success: true,
      scheduled_posts: result.rows || [],
      count: (result.rows || []).length,
    });
  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userEmail = req.headers.get("x-user-email");

  if (!userId && !userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { platforms, content, media_urls, scheduled_time } = await req.json();

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: "At least one platform required" },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    if (!scheduled_time) {
      return NextResponse.json(
        { error: "Scheduled time required" },
        { status: 400 }
      );
    }

    // Validate scheduled time is in future
    if (new Date(scheduled_time) <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    const pg = await getPgClient();

    // Create table if it doesn't exist
    await pg.query(`
      CREATE TABLE IF NOT EXISTS scheduled_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        user_email VARCHAR,
        platforms TEXT[] NOT NULL,
        content TEXT NOT NULL,
        media_urls TEXT[],
        scheduled_time TIMESTAMP NOT NULL,
        status VARCHAR DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const result = await pg.query(
      `INSERT INTO scheduled_posts (user_id, user_email, platforms, content, media_urls, scheduled_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id, platforms, content, media_urls, scheduled_time, status, created_at`,
      [userId || null, userEmail || null, platforms, content, media_urls || [], scheduled_time]
    );

    return NextResponse.json({
      success: true,
      scheduled_post: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating scheduled post:", error);
    return NextResponse.json(
      { error: "Failed to create scheduled post" },
      { status: 500 }
    );
  }
}
