import { corsHeaders } from "./auth.ts";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const cache = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds (default helpers use seconds × 1000) */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number; // seconds
}

/**
 * Generic in-memory rate limiter (Ticket 4).
 *
 * @param key   Unique key, e.g. `functionName:userId`
 * @param config  { maxRequests, windowMs }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = cache.get(key);

  if (!entry || now > entry.resetTime) {
    cache.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

/** Ready-made 429 response with Retry-After header */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded", retry_after: retryAfter }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}
