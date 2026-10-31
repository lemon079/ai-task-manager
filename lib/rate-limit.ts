/**
 * Rate Limiter and Daily Budget Engine
 * Protects endpoints from abuse, controls LLM costs, and manages per-user daily budgets
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const dailyBudgetStore = new Map<string, { requests: number; tokens: number; resetDay: string }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited within a sliding time window
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Periodic cleanup
  if (rateLimitStore.size > 10000) {
    cleanupExpiredEntries();
  }

  // No existing entry or entry has expired
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Entry exists and reached limit
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RATE_LIMITS = {
  /** 30 requests per minute for AI agent endpoints */
  AGENT: { maxRequests: 30, windowMs: 60 * 1000 },
  /** 100 requests per minute for general API endpoints */
  API: { maxRequests: 100, windowMs: 60 * 1000 },
  /** 5 requests per minute for auth endpoints (login, signup) */
  AUTH: { maxRequests: 5, windowMs: 60 * 1000 },
  /** Daily cap per user for agent requests */
  DAILY_USER_CAP: 200,
} as const;

/**
 * Check per-user daily request budget
 */
export function checkDailyBudget(userId: string): { allowed: boolean; remainingRequests: number } {
  const todayKey = new Date().toISOString().split("T")[0];
  const userRecord = dailyBudgetStore.get(userId);

  if (!userRecord || userRecord.resetDay !== todayKey) {
    dailyBudgetStore.set(userId, { requests: 1, tokens: 0, resetDay: todayKey });
    return { allowed: true, remainingRequests: RATE_LIMITS.DAILY_USER_CAP - 1 };
  }

  if (userRecord.requests >= RATE_LIMITS.DAILY_USER_CAP) {
    return { allowed: false, remainingRequests: 0 };
  }

  userRecord.requests++;
  return { allowed: true, remainingRequests: RATE_LIMITS.DAILY_USER_CAP - userRecord.requests };
}

/**
 * Create rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  };
}
