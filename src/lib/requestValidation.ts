/**
 * Request validation utilities
 * Provides schema-based request validation with security best practices
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export type ValidationSchema = {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: (string | number | boolean)[];
  };
};

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate request body against schema
 */
export function validateRequestBody(
  body: unknown,
  schema: ValidationSchema
): { valid: boolean; errors: ValidationError[]; data?: Record<string, unknown> } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Request body must be a valid JSON object' }],
    };
  }

  const data: Record<string, unknown> = {};
  const bodyObj = body as Record<string, unknown>;

  for (const [field, rules] of Object.entries(schema)) {
    const value = bodyObj[field];

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required` });
      continue;
    }

    if (value === undefined || value === null) {
      continue;
    }

    // Check type
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rules.type) {
      errors.push({
        field,
        message: `${field} must be of type ${rules.type}, got ${actualType}`,
      });
      continue;
    }

    // String validations
    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rules.minLength} characters`,
        });
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field,
          message: `${field} must be no more than ${rules.maxLength} characters`,
        });
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({
          field,
          message: `${field} format is invalid`,
        });
      }
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rules.enum.join(', ')}`,
        });
      }
    }

    // Number validations
    if (rules.type === 'number' && typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rules.min}`,
        });
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push({
          field,
          message: `${field} must be no more than ${rules.max}`,
        });
      }
    }

    data[field] = value;
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined,
  };
}

/**
 * Validate request headers for auth and content-type
 */
export function validateRequestHeaders(req: NextRequest): {
  valid: boolean;
  errors: string[];
  token?: string;
} {
  const errors: string[] = [];
  const token =
    req.cookies.get('sb-access-token')?.value ||
    req.headers.get('x-supabase-auth') ||
    null;

  if (!token) {
    errors.push('Missing authentication token');
  }

  return {
    valid: errors.length === 0,
    errors,
    token: token || undefined,
  };
}

/**
 * Create validation error response (no info leakage in production)
 */
export function createValidationErrorResponse(
  errors: ValidationError[] | string[],
  statusCode: number = 400
) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Generic error in production
    return NextResponse.json(
      { error: 'Request validation failed' },
      { status: statusCode }
    );
  }

  // Detailed errors in development
  const formattedErrors = errors.map((err) =>
    typeof err === 'string' ? err : `${err.field}: ${err.message}`
  );

  return NextResponse.json(
    { error: 'Request validation failed', details: formattedErrors },
    { status: statusCode }
  );
}

/**
 * Middleware helper: validate and return parsed body or error response
 */
export async function validateAndParseBody(
  req: NextRequest,
  schema: ValidationSchema
): Promise<{
  valid: boolean;
  data?: Record<string, unknown>;
  response?: Response;
}> {
  try {
    const body = await req.json();
    const validation = validateRequestBody(body, schema);

    if (!validation.valid) {
      return {
        valid: false,
        response: createValidationErrorResponse(validation.errors),
      };
    }

    return { valid: true, data: validation.data };
  } catch (error) {
    return {
      valid: false,
      response: createValidationErrorResponse(['Invalid JSON in request body']),
    };
  }
}
