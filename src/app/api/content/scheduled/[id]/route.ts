import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get("x-user-id");
  const userEmail = req.headers.get("x-user-email");
  const { id } = await params;

  if (!userId && !userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pg = await getPgClient();

    let query = `
      SELECT id, platforms, content, media_urls, scheduled_time, status, created_at, updated_at
      FROM scheduled_posts
      WHERE id = $1
    `;

    const params: any[] = [id];

    if (userId) {
      query += ` AND user_id = $2`;
      params.push(userId);
    } else if (userEmail) {
      query += ` AND user_email = $2`;
      params.push(userEmail);
    }

    const result = await pg.query(query, params);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      scheduled_post: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching scheduled post:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get("x-user-id");
  const userEmail = req.headers.get("x-user-email");
  const { id } = await params;

  if (!userId && !userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { platforms, content, media_urls, scheduled_time } = await req.json();

    if (platforms && (!Array.isArray(platforms) || platforms.length === 0)) {
      return NextResponse.json(
        { error: "At least one platform required" },
        { status: 400 }
      );
    }

    if (content && content.trim().length === 0) {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    if (scheduled_time && new Date(scheduled_time) <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    const pg = await getPgClient();

    let query = `
      UPDATE scheduled_posts
      SET ${[
        platforms && "platforms = $2",
        content && "content = $3",
        media_urls && "media_urls = $4",
        scheduled_time && "scheduled_time = $5",
        "updated_at = NOW()",
      ]
        .filter(Boolean)
        .join(", ")}
      WHERE id = $1
    `;

    const updateParams = [id];
    if (platforms) updateParams.push(platforms);
    if (content) updateParams.push(content);
    if (media_urls) updateParams.push(media_urls);
    if (scheduled_time) updateParams.push(scheduled_time);

    if (userId) {
      query += ` AND user_id = $${updateParams.length + 1}`;
      updateParams.push(userId);
    } else if (userEmail) {
      query += ` AND user_email = $${updateParams.length + 1}`;
      updateParams.push(userEmail);
    }

    query += ` RETURNING id, platforms, content, media_urls, scheduled_time, status, created_at, updated_at`;

    const result = await pg.query(query, updateParams);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      scheduled_post: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating scheduled post:", error);
    return NextResponse.json(
      { error: "Failed to update scheduled post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get("x-user-id");
  const userEmail = req.headers.get("x-user-email");
  const { id } = await params;

  if (!userId && !userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pg = await getPgClient();

    let query = `
      DELETE FROM scheduled_posts
      WHERE id = $1
    `;

    const params: any[] = [id];

    if (userId) {
      query += ` AND user_id = $2`;
      params.push(userId);
    } else if (userEmail) {
      query += ` AND user_email = $2`;
      params.push(userEmail);
    }

    await pg.query(query, params);

    return NextResponse.json({
      success: true,
      message: "Scheduled post deleted",
    });
  } catch (error) {
    console.error("Error deleting scheduled post:", error);
    return NextResponse.json(
      { error: "Failed to delete scheduled post" },
      { status: 500 }
    );
  }
}

