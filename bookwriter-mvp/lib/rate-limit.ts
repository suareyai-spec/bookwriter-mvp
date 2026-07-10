import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/config";
import { Redis } from "@upstash/redis";

// ──── Storage backend ────────────────────────────────────────────────────
// Uses Upstash Redis when configured (UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN); falls back to an in-process Map otherwise so
// rate limiting still works in local dev / single-instance deployments.

interface Store {
  incrWithExpiry(key: string, windowSeconds: number): Promise<number>;
  incrBy(key: string, amount: number, ttlSeconds: number): Promise<number>;
  get(key: string): Promise<number>;
}

class MemoryStore implements Store {
  private data = new Map<string, { count: number; resetAt: number }>();

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.data) {
        if (now >= entry.resetAt) this.data.delete(key);
      }
    }, 5 * 60 * 1000);
  }

  async incrWithExpiry(key: string, windowSeconds: number): Promise<number> {
    const now = Date.now();
    const entry = this.data.get(key);
    if (!entry || now >= entry.resetAt) {
      this.data.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return 1;
    }
    entry.count++;
    return entry.count;
  }

  async incrBy(key: string, amount: number, ttlSeconds: number): Promise<number> {
    const now = Date.now();
    const entry = this.data.get(key);
    if (!entry || now >= entry.resetAt) {
      const count = Math.max(0, amount);
      this.data.set(key, { count, resetAt: now + ttlSeconds * 1000 });
      return count;
    }
    entry.count = Math.max(0, entry.count + amount);
    entry.resetAt = now + ttlSeconds * 1000;
    return entry.count;
  }

  async get(key: string): Promise<number> {
    const entry = this.data.get(key);
    if (!entry || Date.now() >= entry.resetAt) return 0;
    return entry.count;
  }
}

let store: Store | null = null;

function getStore(): Store {
  if (store) return store;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });

    store = {
      async incrWithExpiry(key, windowSeconds) {
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, windowSeconds);
        return count;
      },
      async incrBy(key, amount, ttlSeconds) {
        const count = await redis.incrby(key, amount);
        await redis.expire(key, ttlSeconds);
        return Math.max(0, count);
      },
      async get(key) {
        const val = await redis.get<number>(key);
        return val ?? 0;
      },
    };
  } else {
    store = new MemoryStore();
  }

  return store;
}

// ──── Generic sliding-window limiter (used by existing per-route limits) ──

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetIn: number; // seconds
}

async function checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<RateLimitResult> {
  const count = await getStore().incrWithExpiry(key, windowSeconds);
  return {
    success: count <= maxRequests,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetIn: windowSeconds,
  };
}

function addRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.resetIn));
  return response;
}

function make429(result: RateLimitResult): NextResponse {
  const minutes = Math.ceil(result.resetIn / 60);
  const res = NextResponse.json(
    { error: `Too many requests. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`, retryAfter: result.resetIn },
    { status: 429 }
  );
  return addRateLimitHeaders(res, result);
}

/**
 * Rate limit by authenticated user. Returns null if allowed, or a 429 Response if blocked.
 * Also returns headers helper to add to successful responses.
 */
export async function rateLimitByUser(
  routeName: string,
  maxRequests: number,
  windowMs: number
): Promise<{ blocked: NextResponse | null; headers: (res: NextResponse) => NextResponse }> {
  const session = await getServerSession(authOptions);

  // Admin bypass
  if (session?.user?.email && isAdmin(session.user.email)) {
    return { blocked: null, headers: (res) => res };
  }

  const key = `rl:${routeName}:${session?.user?.email || "anon"}`;
  const result = await checkRateLimit(key, maxRequests, Math.round(windowMs / 1000));

  if (!result.success) {
    return { blocked: make429(result), headers: (res) => res };
  }

  return { blocked: null, headers: (res) => addRateLimitHeaders(res, result) };
}

/**
 * Rate limit by IP (for auth routes). Returns null if allowed, or a 429 Response.
 */
export async function rateLimitByIP(
  req: Request,
  routeName: string,
  maxRequests: number,
  windowMs: number
): Promise<{ blocked: NextResponse | null; headers: (res: NextResponse) => NextResponse }> {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const key = `rl:${routeName}:ip:${ip}`;
  const result = await checkRateLimit(key, maxRequests, Math.round(windowMs / 1000));

  if (!result.success) {
    return { blocked: make429(result), headers: (res) => res };
  }

  return { blocked: null, headers: (res) => addRateLimitHeaders(res, result) };
}

// ──── Generation limits: 3 concurrent / 10 per hour / 50 per day ──────────

const GENERATION_LIMIT_MESSAGE = "You have hit the generation limit. Please wait before starting another.";
const MAX_CONCURRENT = 3;
const MAX_PER_HOUR = 10;
const MAX_PER_DAY = 50;

function concurrentKey(userId: string) { return `genlimit:concurrent:${userId}`; }
function hourlyKey(userId: string) { return `genlimit:hourly:${userId}`; }
function dailyKey(userId: string) { return `genlimit:daily:${userId}`; }

/**
 * Call before dispatching a generation job. Checks concurrent/hourly/daily caps
 * and, if allowed, reserves a concurrency slot and counts the hourly/daily usage.
 * Once the job finishes (success or failure), call releaseGenerationSlot(userId).
 */
export async function acquireGenerationSlot(
  userId: string,
  userEmail?: string | null
): Promise<{ allowed: boolean; error?: NextResponse }> {
  if (userEmail && isAdmin(userEmail)) {
    return { allowed: true };
  }

  const s = getStore();

  const [concurrent, hourly, daily] = await Promise.all([
    s.get(concurrentKey(userId)),
    s.get(hourlyKey(userId)),
    s.get(dailyKey(userId)),
  ]);

  if (concurrent >= MAX_CONCURRENT || hourly >= MAX_PER_HOUR || daily >= MAX_PER_DAY) {
    return {
      allowed: false,
      error: NextResponse.json({ error: GENERATION_LIMIT_MESSAGE }, { status: 429 }),
    };
  }

  await Promise.all([
    s.incrBy(concurrentKey(userId), 1, 30 * 60), // 30-min safety TTL in case release is missed
    s.incrWithExpiry(hourlyKey(userId), 60 * 60),
    s.incrWithExpiry(dailyKey(userId), 24 * 60 * 60),
  ]);

  return { allowed: true };
}

/** Call once a generation job finishes (success or failure) to free its concurrency slot. */
export async function releaseGenerationSlot(userId: string): Promise<void> {
  try {
    await getStore().incrBy(concurrentKey(userId), -1, 30 * 60);
  } catch (err) {
    console.error("[rate-limit] failed to release generation slot:", err);
  }
}

export { GENERATION_LIMIT_MESSAGE };
