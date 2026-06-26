import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import {
  createValidationErrorResponse,
  validateRequestBody,
  type ValidationSchema,
} from "@/lib/requestValidation";
import { serverErrorResponse } from "@/lib/apiAuth";

const SCHEDULED_POST_SCHEMA: ValidationSchema = {
  platforms: {
    type: "array",
    required: true,
  },
  content: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 5000,
  },
  media_urls: {
    type: "array",
    required: false,
  },
  scheduled_time: {
    type: "string",
    required: true,
  },
};

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
    const body = await req.json().catch(() => null);
    if (!body) {
      return createValidationErrorResponse(["Invalid JSON in request body"]);
    }

    const validation = validateRequestBody(body, SCHEDULED_POST_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const platforms = Array.isArray(validation.data?.platforms)
      ? validation.data.platforms
      : [];
    const content = String(validation.data?.content || "").trim();
    const media_urls = Array.isArray(validation.data?.media_urls)
      ? validation.data.media_urls
      : [];
    const scheduled_time = String(validation.data?.scheduled_time || "");

    if (platforms.length === 0) {
      return NextResponse.json(
        { error: "At least one platform required" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const allowedPlatforms = new Set([
      "facebook",
      "instagram",
      "linkedin",
      "youtube",
      "tiktok",
      "twitter",
      "pinterest",
      "twitch",
      "discord",
    ]);

    const invalidPlatform = platforms.find(
      (platform) => typeof platform !== "string" || !allowedPlatforms.has(platform)
    );

    if (invalidPlatform) {
      return NextResponse.json({ error: "Invalid platform in request" }, { status: 400 });
    }

    const invalidMediaUrl = media_urls.find(
      (url) => typeof url !== "string" || url.length > 2048
    );

    if (invalidMediaUrl) {
      return NextResponse.json({ error: "Invalid media_urls value" }, { status: 400 });
    }

    const scheduledDate = new Date(scheduled_time);
    if (Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid scheduled_time" }, { status: 400 });
    }

    // Validate scheduled time is in future
    if (scheduledDate <= new Date()) {
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
    return serverErrorResponse(error);
  }
}


