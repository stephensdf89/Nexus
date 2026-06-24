import { NextResponse } from "next/server";
import { getPgClient } from "@/lib/pg";

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

export async function GET() {
  try {
    const db = await getPgClient();
    const result = await db.query(`SELECT settings FROM public.app_settings WHERE id = 1 LIMIT 1`);

    return NextResponse.json({
      settings: normalizeSettings(result.rows[0]?.settings),
    });
  } catch (error) {
    console.error("Public app settings GET failed:", error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}