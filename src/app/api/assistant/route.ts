import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import { getEffectiveAccess, getUserFromRequest } from "@/lib/serverAccess";
import {
  validateRequestBody,
  createValidationErrorResponse,
  type ValidationSchema,
} from "@/lib/requestValidation";
import { serverErrorResponse } from "@/lib/apiAuth";

type ChatRole = "user" | "assistant" | "system";

const ASSISTANT_POST_SCHEMA: ValidationSchema = {
  message: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 2000,
  },
  mode: {
    type: "string",
    required: false,
    enum: ["standard", "creative", "strict"],
  },
  threadId: {
    type: "string",
    required: false,
  },
};

type StoredMessage = {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
};

function systemPromptForMode(mode: string) {
  switch (mode) {
    case "creative":
      return "You are Creator Nexus AI. Be imaginative, give multiple ideas, and keep answers practical.";
    case "strict":
      return "You are Creator Nexus AI. Be concise, direct, and output only concrete action steps.";
    default:
      return "You are Creator Nexus AI. Be clear, practical, and helpful for creators.";
  }
}

async function createThread(userId: string) {
  const db = await getPgClient();
  const result = await db.query(
    `INSERT INTO public.ai_threads (user_id, title)
     VALUES ($1, $2)
     RETURNING id`,
    [userId, "New assistant chat"]
  );
  return result.rows[0].id as string;
}

async function assertThreadOwnership(threadId: string, userId: string) {
  const db = await getPgClient();
  const result = await db.query(
    `SELECT id FROM public.ai_threads WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [threadId, userId]
  );
  return result.rows.length > 0;
}

async function getThreadMessages(threadId: string, userId: string) {
  const db = await getPgClient();
  const result = await db.query(
    `SELECT id, role, content, created_at
     FROM public.ai_messages
     WHERE thread_id = $1 AND user_id = $2
     ORDER BY created_at ASC`,
    [threadId, userId]
  );
  return result.rows as StoredMessage[];
}

async function saveMessage(threadId: string, userId: string, role: ChatRole, content: string, model?: string) {
  const db = await getPgClient();
  await db.query(
    `INSERT INTO public.ai_messages (thread_id, user_id, role, content, model)
     VALUES ($1, $2, $3, $4, $5)`,
    [threadId, userId, role, content, model || null]
  );

  await db.query(
    `UPDATE public.ai_threads
     SET updated_at = NOW(),
         title = CASE WHEN title = 'New assistant chat' AND $3 = 'user' THEN LEFT($4, 80) ELSE title END
     WHERE id = $1 AND user_id = $2`,
    [threadId, userId, role, content]
  );
}

async function callOpenAI(messages: Array<{ role: ChatRole; content: string }>, mode: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: mode === "creative" ? 0.9 : mode === "strict" ? 0.2 : 0.6,
      messages,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned empty content");
  }

  return { content: String(content), model };
}

function buildLocalAssistantReply(message: string, mode: string) {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) {
    return "Share a goal and I will help you plan it.";
  }

  const intro =
    mode === "strict"
      ? "Local mode:"
      : mode === "creative"
      ? "Local creative mode:"
      : "Local mode:";

  if (lower.includes("content") || lower.includes("post") || lower.includes("idea")) {
    return `${intro} Try this 3-part content sprint:\n1) Pick one audience pain point.\n2) Publish one short post, one carousel, and one CTA post over 3 days.\n3) Track saves, comments, and click-through, then repeat the best performer next week.`;
  }

  if (lower.includes("schedule") || lower.includes("calendar") || lower.includes("plan")) {
    return `${intro} Weekly plan template:\n- Monday: educational post\n- Wednesday: case study or proof\n- Friday: offer + CTA\nBatch draft all 3 pieces in one sitting and schedule them the same day.`;
  }

  if (lower.includes("growth") || lower.includes("followers") || lower.includes("audience")) {
    return `${intro} Growth checklist:\n- Improve hook in first 2 lines\n- Add one clear CTA per post\n- Reply to comments within 30 minutes\n- Repost the top-performing topic in a new format`;
  }

  return `${intro} I can help with content strategy, scheduling, offers, and growth.\nYour prompt: "${trimmed.slice(0, 180)}"\nNext step: tell me your niche, platform, and weekly posting capacity.`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = req.nextUrl.searchParams.get("threadId");
    if (!threadId) {
      return NextResponse.json({ error: "threadId is required" }, { status: 400 });
    }

    const owns = await assertThreadOwnership(threadId, user.id);
    if (!owns) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const messages = await getThreadMessages(threadId, user.id);
    return NextResponse.json({ threadId, messages });
  } catch (error) {
    console.error("Assistant GET failed:", error);
    return NextResponse.json({ error: "Failed to load assistant thread" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return createValidationErrorResponse(["Invalid JSON in request body"]);
    }

    // Validate request body
    const validation = validateRequestBody(body, ASSISTANT_POST_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const message = String(validation.data?.message || "").trim();
    const mode = String(validation.data?.mode || "standard");
    let threadId = validation.data?.threadId ? String(validation.data.threadId) : "";

    if (!message) {
      return createValidationErrorResponse([
        { field: "message", message: "Message cannot be empty" },
      ]);
    }

    if (threadId) {
      const owns = await assertThreadOwnership(threadId, user.id);
      if (!owns) {
        return NextResponse.json({ error: "Thread not found" }, { status: 404 });
      }
    } else {
      threadId = await createThread(user.id);
    }

    const previous = await getThreadMessages(threadId, user.id);

    await saveMessage(threadId, user.id, "user", message);

    const promptMessages = [
      { role: "system" as ChatRole, content: systemPromptForMode(mode) },
      ...previous.slice(-12).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as ChatRole, content: message },
    ];

    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const { isOwner, accessLevel } = await getEffectiveAccess(user);
    const canUsePaidModel = isOwner || accessLevel === "pro" || accessLevel === "admin";
    const ai = hasOpenAI
      ? canUsePaidModel
        ? await callOpenAI(promptMessages, mode)
        : {
            content:
              "Paid AI model access is not enabled for this account yet. You still have local assistant mode. Ask the owner to upgrade your account in the dashboard.",
            model: "local-fallback",
          }
      : {
          content: buildLocalAssistantReply(message, mode),
          model: "local-fallback",
        };

    await saveMessage(threadId, user.id, "assistant", ai.content, ai.model);

    return NextResponse.json({
      threadId,
      reply: ai.content,
      model: ai.model,
    });
  } catch (error) {
    console.error("Assistant POST failed:", error);
    return serverErrorResponse(error);
  }
}
