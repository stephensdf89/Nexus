import { NextRequest, NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";
import { requireAccess, writeAccessAuditLog } from "@/lib/serverAccess";
import {
  validateRequestBody,
  createValidationErrorResponse,
  type ValidationSchema,
} from "@/lib/requestValidation";

const APP_SETTINGS_SCHEMA: ValidationSchema = {
  settings: {
    type: "object",
    required: true,
  },
};

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  allowSignups: true,
  allowPaidModels: true,
  defaultAccessLevel: "user",
  bannerMessage: "",
};

function normalizeSettings(value: unknown) {
  const incoming = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    ...DEFAULT_SETTINGS,
    ...incoming,
    maintenanceMode: Boolean(incoming.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode),
    allowSignups: Boolean(incoming.allowSignups ?? DEFAULT_SETTINGS.allowSignups),
    allowPaidModels: Boolean(incoming.allowPaidModels ?? DEFAULT_SETTINGS.allowPaidModels),
    defaultAccessLevel:
      String(incoming.defaultAccessLevel || DEFAULT_SETTINGS.defaultAccessLevel).toLowerCase() === "admin"
        ? "admin"
        : String(incoming.defaultAccessLevel || DEFAULT_SETTINGS.defaultAccessLevel).toLowerCase() === "pro"
          ? "pro"
          : "user",
    bannerMessage: String(incoming.bannerMessage || "").slice(0, 280),
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAccess(req, "admin", "/api/admin/app-settings");
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = await getPgClient();
    const result = await db.query(`SELECT settings FROM public.app_settings WHERE id = 1 LIMIT 1`);

    return NextResponse.json({
      settings: normalizeSettings(result.rows[0]?.settings),
    });
  } catch (error) {
    console.error("Admin app settings GET failed:", error);
    return NextResponse.json({ error: "Failed to load app settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAccess(req, "admin", "/api/admin/app-settings");
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = validateRequestBody(body, APP_SETTINGS_SCHEMA);
    if (!validation.valid) {
      return createValidationErrorResponse(validation.errors);
    }

    const settings = normalizeSettings(validation.data?.settings);
    const db = await getPgClient();

    await db.query(
      `INSERT INTO public.app_settings (id, settings, updated_at)
       VALUES (1, $1::jsonb, NOW())
       ON CONFLICT (id)
       DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW()`,
      [JSON.stringify(settings)]
    );

    await writeAccessAuditLog({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email || null,
      eventType: "app_settings_change",
      resource: "/api/admin/app-settings",
      success: true,
      details: { settings },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Admin app settings POST failed:", error);
    return NextResponse.json({ error: "Failed to save app settings" }, { status: 500 });
  }
}