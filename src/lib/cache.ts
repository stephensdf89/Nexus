/**
 * In-memory cache for analytics and API responses
 * In production, consider using Redis for distributed caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();

  set(key: string, data: T, ttlSeconds: number = 300): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /**
   * Get all keys matching a pattern
   */
  keys(pattern: string): string[] {
    const regex = new RegExp(pattern);
    return Array.from(this.store.keys()).filter((key) => regex.test(key));
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete = this.keys(pattern);
    keysToDelete.forEach((key) => this.delete(key));
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton instances
export const analyticsCache = new Cache<any>();
export const apiResponseCache = new Cache<any>();
export const platformCache = new Cache<any>();

/**
 * Cache key generators
 */
export const cacheKeys = {
  analytics: (userId: string, email: string) =>
    `analytics:${userId || email}:summary`,
  platformMetrics: (userId: string, email: string, platform: string) =>
    `metrics:${userId || email}:${platform}`,
  timeseries: (userId: string, email: string, timeframe: string) =>
    `timeseries:${userId || email}:${timeframe}`,
  scheduledPosts: (userId: string, email: string) =>
    `scheduled:${userId || email}:all`,
  integrationStatus: (userId: string, email: string, platform: string) =>
    `status:${userId || email}:${platform}`,
};

/**
 * Cache durations (in seconds)
 */
export const cacheDurations = {
  analytics: 300, // 5 minutes
  platformMetrics: 300, // 5 minutes
  timeseries: 600, // 10 minutes
  scheduledPosts: 180, // 3 minutes
  integrationStatus: 120, // 2 minutes
  shortLived: 60, // 1 minute
};

/**
 * Utility to get cached value or fetch fresh data
 */
export async function getCachedOrFetch<T>(
  cacheInstance: Cache<T>,
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  // Check cache first
  const cached = cacheInstance.get(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache the result
  cacheInstance.set(key, data, ttlSeconds);

  return data;
}

export default Cache;
