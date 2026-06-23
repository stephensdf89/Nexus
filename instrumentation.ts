import * as Sentry from "@sentry/nextjs";
import { validateEnvironment } from "@/lib/env";

export async function register() {
  // Validate environment on startup
  const envValidation = validateEnvironment();
  if (envValidation.errors.length > 0) {
    console.error("❌ Environment validation failed:");
    envValidation.errors.forEach((err) => console.error(`  - ${err}`));
    if (process.env.NODE_ENV === "production") {
      throw new Error("Critical environment variables are missing");
    }
  }

  if (envValidation.warnings.length > 0) {
    console.warn("⚠️  Environment warnings:");
    envValidation.warnings.forEach((warn) => console.warn(`  - ${warn}`));
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;