/**
 * Performance monitoring and metrics collection
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  status: "success" | "error";
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000;

  /**
   * Record a performance metric
   */
  record(
    name: string,
    duration: number,
    status: "success" | "error" = "success",
    metadata?: Record<string, any>
  ): void {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      status,
      metadata,
    });

    // Keep memory bounded
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Time an async operation
   */
  async timeAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.record(name, Date.now() - start, "success", metadata);
      return result;
    } catch (error) {
      this.record(name, Date.now() - start, "error", metadata);
      throw error;
    }
  }

  /**
   * Time a sync operation
   */
  time<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const start = Date.now();
    try {
      const result = fn();
      this.record(name, Date.now() - start, "success", metadata);
      return result;
    } catch (error) {
      this.record(name, Date.now() - start, "error", metadata);
      throw error;
    }
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Calculate average duration for an operation
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    operations: Record<string, { count: number; avgDuration: number }>;
    slowestOperations: Array<{ name: string; duration: number }>;
  } {
    const operations: Record<string, { count: number; avgDuration: number }> = {};

    this.metrics.forEach((m) => {
      if (!operations[m.name]) {
        operations[m.name] = { count: 0, avgDuration: 0 };
      }
      operations[m.name].count++;
    });

    // Calculate averages
    Object.keys(operations).forEach((name) => {
      operations[name].avgDuration = this.getAverageDuration(name);
    });

    // Find slowest operations
    const slowestOperations = this.metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map((m) => ({ name: m.name, duration: m.duration }));

    return {
      totalMetrics: this.metrics.length,
      operations,
      slowestOperations,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  export(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Middleware for Next.js API routes to track performance
 */
export function createPerformanceMiddleware(
  handler: (req: any, res: any) => Promise<void> | void
) {
  return async (req: any, res: any) => {
    const startTime = Date.now();
    const operationName = `${req.method} ${req.nextUrl.pathname}`;

    try {
      res.on("finish", () => {
        const duration = Date.now() - startTime;
        performanceMonitor.record(
          operationName,
          duration,
          res.statusCode < 400 ? "success" : "error",
          {
            method: req.method,
            path: req.nextUrl.pathname,
            statusCode: res.statusCode,
          }
        );
      });

      return await handler(req, res);
    } catch (error) {
      const duration = Date.now() - startTime;
      performanceMonitor.record(operationName, duration, "error", {
        method: req.method,
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };
}

export default PerformanceMonitor;
