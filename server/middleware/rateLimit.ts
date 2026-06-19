/**
 * In-memory rate limiting middleware for tRPC procedures.
 * Uses a sliding window approach per IP address.
 * 
 * Limits:
 * - Form submissions: 5 per IP per hour
 * - AI chat: 20 per IP per hour
 * - General public writes: 10 per IP per hour
 */
import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "../_core/context";

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store (resets on server restart, which is fine for serverless)
const stores: Record<string, Map<string, RateLimitEntry>> = {};

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores[name]) {
    stores[name] = new Map();
  }
  return stores[name];
}

function getClientIp(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * Clean expired entries periodically (every 100 checks)
 */
let cleanupCounter = 0;
function maybeCleanup(store: Map<string, RateLimitEntry>, windowMs: number) {
  cleanupCounter++;
  if (cleanupCounter % 100 === 0) {
    const now = Date.now();
    const keys = Array.from(store.keys());
    for (const key of keys) {
      const entry = store.get(key)!;
      entry.timestamps = entry.timestamps.filter((t: number) => now - t < windowMs);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }
}

interface RateLimitOptions {
  /** Name of this limiter (used for separate stores) */
  name: string;
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Custom error message */
  message?: string;
}

/**
 * Creates a tRPC middleware that rate-limits by client IP.
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  const { name, maxRequests, windowMs, message } = options;
  const store = getStore(name);

  return async function rateLimitMiddleware({ ctx, next }: { ctx: TrpcContext; next: () => any }) {
    const ip = getClientIp(ctx.req);
    const now = Date.now();

    maybeCleanup(store, windowMs);

    let entry = store.get(ip);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(ip, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfterMs = windowMs - (now - oldestInWindow);
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: message || `Too many requests. Please try again in ${retryAfterSec} seconds.`,
      });
    }

    // Record this request
    entry.timestamps.push(now);

    return next();
  };
}

// Pre-configured limiters
export const formSubmissionLimiter = createRateLimitMiddleware({
  name: "form-submissions",
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many form submissions. Please wait before submitting again.",
});

export const aiChatLimiter = createRateLimitMiddleware({
  name: "ai-chat",
  maxRequests: 20,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Chat rate limit reached. Please try again later.",
});

export const generalPublicWriteLimiter = createRateLimitMiddleware({
  name: "public-writes",
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests. Please try again later.",
});
