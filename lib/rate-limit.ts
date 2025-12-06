/**
 * Simple in-memory rate limiter for API protection
 * For production, consider using Redis-based solutions
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (userId, IP, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and metadata
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Clean up expired entries periodically
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

    // Entry exists and is still valid
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
} as const;

/**
 * Create rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
    };
}
