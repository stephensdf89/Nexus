/**
 * Environment validation module
 * Validates all required production environment variables at app startup
 * Prevents runtime failures from missing config
 */

const REQUIRED_ENV_VARS = {
  public: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  server: [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
  ],
  optional: [
    'NEXT_PUBLIC_SENTRY_DSN',
    'SENTRY_DSN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'SENTRY_AUTH_TOKEN',
    'OPENAI_API_KEY',
    'FACEBOOK_CLIENT_ID',
    'FACEBOOK_CLIENT_SECRET',
    'SLACK_WEBHOOK_URL',
  ],
};

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required public vars
  for (const varName of REQUIRED_ENV_VARS.public) {
    if (!process.env[varName]) {
      errors.push(`Missing required public environment variable: ${varName}`);
    }
  }

  // Check required server vars (only on server-side)
  if (typeof window === 'undefined') {
    for (const varName of REQUIRED_ENV_VARS.server) {
      if (!process.env[varName]) {
        errors.push(`Missing required server environment variable: ${varName}`);
      }
    }
  }

  // Warn about optional but recommended vars in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      warnings.push('Sentry monitoring disabled (NEXT_PUBLIC_SENTRY_DSN not set)');
    }
    if (!process.env.SLACK_WEBHOOK_URL) {
      warnings.push('Slack alerts disabled (SLACK_WEBHOOK_URL not set)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment and throw if critical vars are missing
 * Call this at app startup in middleware.ts or instrumentation.ts
 */
export function assertEnvironmentValid(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    const errorMsg = `Environment validation failed:\n${result.errors.join('\n')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (result.warnings.length > 0) {
    console.warn(`Environment warnings:\n${result.warnings.join('\n')}`);
  }
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export function getEnvOptional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}
