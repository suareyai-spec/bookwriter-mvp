import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/config";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetIn: number; // seconds
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, resetIn: Math.ceil(windowMs / 1000) };
  }

  entry.count++;
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);

  if (entry.count > maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, resetIn };
  }

  return { success: true, limit: maxRequests, remaining: maxRequests - entry.count, resetIn };
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

  const key = `${routeName}:${session?.user?.email || "anon"}`;
  const result = checkRateLimit(key, maxRequests, windowMs);

  if (!result.success) {
    return { blocked: make429(result), headers: (res) => res };
  }

  return { blocked: null, headers: (res) => addRateLimitHeaders(res, result) };
}

/**
 * Rate limit by IP (for auth routes). Returns null if allowed, or a 429 Response.
 */
export function rateLimitByIP(
  req: Request,
  routeName: string,
  maxRequests: number,
  windowMs: number
): { blocked: NextResponse | null; headers: (res: NextResponse) => NextResponse } {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const key = `${routeName}:ip:${ip}`;
  const result = checkRateLimit(key, maxRequests, windowMs);

  if (!result.success) {
    return { blocked: make429(result), headers: (res) => res };
  }

  return { blocked: null, headers: (res) => addRateLimitHeaders(res, result) };
}
