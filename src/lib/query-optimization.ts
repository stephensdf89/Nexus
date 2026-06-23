/**
 * Query optimization utilities for database operations
 */

import { getPgClient } from "@/lib/pg";

/**
 * Batch fetch platform metrics in a single query when possible
 */
export async function batchFetchPlatformStatus(
  userId: string | null,
  email: string | null
) {
  const pg = await getPgClient();

  try {
    let query = `
      SELECT platform, platform_id, channel_name, created_at, updated_at
      FROM integrations
      WHERE 1=1
    `;

    const params: any[] = [];

    if (userId) {
      query += ` AND user_id = $${params.length + 1}`;
      params.push(userId);
    } else if (email) {
      query += ` AND user_email = $${params.length + 1}`;
      params.push(email);
    }

    query += ` ORDER BY platform, created_at DESC`;

    const result = await pg.query(query, params);
    return result.rows || [];
  } catch (error) {
    console.error("Error batch fetching platform status:", error);
    return [];
  }
}

/**
 * Connection pool optimization for database
 */
export function getOptimizedPgConfig() {
  return {
    max: 20, // Connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

/**
 * Index recommendations for frequently queried fields
 */
export const indexRecommendations = [
  "CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_integrations_email ON integrations(user_email)",
  "CREATE INDEX IF NOT EXISTS idx_integrations_platform ON integrations(platform)",
  "CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_scheduled_posts_email ON scheduled_posts(user_email)",
  "CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time ON scheduled_posts(scheduled_time)",
];

/**
 * Query execution with automatic retry on transient failures
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors
      if (error instanceof Error && error.message.includes("INVALID")) {
        throw error;
      }

      // Exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError || new Error("Query execution failed after retries");
}

/**
 * Optimize analytics query by selecting only needed columns
 */
export async function fetchOptimizedAnalytics(
  userId: string | null,
  email: string | null
) {
  const pg = await getPgClient();

  try {
    // Select only necessary columns to reduce data transfer
    const query = `
      SELECT 
        platform,
        COUNT(*) as connection_count,
        MAX(updated_at) as last_updated
      FROM integrations
      WHERE (user_id = $1 OR user_email = $2)
      GROUP BY platform
    `;

    const result = await pg.query(query, [userId || null, email || null]);
    return result.rows || [];
  } catch (error) {
    console.error("Error fetching optimized analytics:", error);
    return [];
  }
}

/**
 * Pagination helper for large result sets
 */
export function createPaginationQuery(
  baseQuery: string,
  page: number = 1,
  pageSize: number = 50
) {
  const offset = (page - 1) * pageSize;
  return `${baseQuery} LIMIT $1 OFFSET $2`;
}

/**
 * Aggregate multiple queries into one for efficiency
 */
export async function aggregateMultipleMetrics(
  userId: string | null,
  email: string | null
) {
  const pg = await getPgClient();

  try {
    // Execute multiple aggregations in a single batch
    const results = await pg.query(`
      SELECT
        (SELECT COUNT(*) FROM integrations WHERE user_id = $1 OR user_email = $2) as total_integrations,
        (SELECT COUNT(DISTINCT platform) FROM integrations WHERE user_id = $1 OR user_email = $2) as unique_platforms,
        (SELECT MAX(created_at) FROM integrations WHERE user_id = $1 OR user_email = $2) as first_integration,
        (SELECT MAX(updated_at) FROM integrations WHERE user_id = $1 OR user_email = $2) as last_updated
    `, [userId || null, email || null]);

    return results.rows[0] || {};
  } catch (error) {
    console.error("Error aggregating metrics:", error);
    return {};
  }
}
