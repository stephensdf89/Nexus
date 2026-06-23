/**
 * Response optimization utilities for API endpoints
 */

/**
 * Compress response payload by removing unnecessary fields
 */
export function compressPayload<T extends Record<string, any>>(
  data: T,
  keepFields: string[]
): Partial<T> {
  const result: Partial<T> = {};

  keepFields.forEach((field) => {
    if (field in data) {
      result[field as keyof T] = data[field as keyof T];
    }
  });

  return result;
}

/**
 * Pagination response formatter
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Serialize large numbers as strings to prevent precision loss
 */
export function formatLargeNumbers<T extends Record<string, any>>(
  obj: T,
  numberFields: string[]
): T {
  const result = { ...obj };

  numberFields.forEach((field) => {
    if (field in result && typeof result[field as keyof T] === "number") {
      const num = result[field as keyof T] as unknown as number;
      result[field as keyof T] = (
        num > 999999 ? num.toLocaleString() : num
      ) as any;
    }
  });

  return result;
}

/**
 * Flatten nested objects for better performance
 */
export function flattenObject<T extends Record<string, any>>(
  obj: T,
  prefix: string = ""
): Record<string, any> {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  });

  return result;
}

/**
 * Response caching headers
 */
export function getCacheHeaders(maxAge: number = 300) {
  return {
    "Cache-Control": `public, max-age=${maxAge}`,
    "Content-Type": "application/json",
  };
}

/**
 * Conditional response based on request headers
 */
export function shouldUseCache(
  request: Request,
  cacheMaxAge: number = 300
): boolean {
  const cacheControl = request.headers.get("cache-control");
  const ifModifiedSince = request.headers.get("if-modified-since");

  if (cacheControl?.includes("no-cache")) {
    return false;
  }

  if (ifModifiedSince) {
    const lastModified = new Date(ifModifiedSince).getTime();
    const now = Date.now();
    return now - lastModified < cacheMaxAge * 1000;
  }

  return true;
}

/**
 * Stream response for large datasets
 */
export async function* streamResponse<T>(
  items: T[],
  chunkSize: number = 100
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    yield chunk;

    // Simulate streaming delay
    await new Promise((resolve) => setImmediate(resolve));
  }
}

/**
 * Response time tracking
 */
export function trackResponseTime(
  startTime: number,
  operation: string
): { duration: number; message: string } {
  const duration = Date.now() - startTime;
  const message = `${operation} completed in ${duration}ms`;

  if (duration > 1000) {
    console.warn(`⚠️ ${message}`);
  } else {
    console.log(`✓ ${message}`);
  }

  return { duration, message };
}

/**
 * API response versioning helper
 */
export function versionedResponse<T>(
  data: T,
  version: string = "v1"
) {
  return {
    version,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Error response standardization
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  details?: Record<string, any>
) {
  return {
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };
}
