/**
 * Centralized tRPC error handling middleware.
 * Catches all procedure errors, logs them consistently, and returns
 * user-friendly messages while preserving internal details for debugging.
 */
import { TRPCError } from "@trpc/server";
import { middleware } from "../_core/trpc";

/**
 * Error logging middleware — wraps all procedures to:
 * 1. Log errors with context (procedure path, user, input)
 * 2. Convert unexpected errors to INTERNAL_SERVER_ERROR
 * 3. Preserve TRPCErrors as-is (they have intentional codes/messages)
 */
export const errorHandlerMiddleware = middleware(async ({ ctx, next, path }: { ctx: any; next: () => any; path: string }) => {
  const start = Date.now();

  try {
    const result = await next();
    const duration = Date.now() - start;

    // Log slow queries (> 2s)
    if (duration > 2000) {
      console.warn(`[SLOW] ${path} took ${duration}ms`, {
        userId: (ctx as any).user?.id,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    // If it's already a TRPCError, log and re-throw
    if (error instanceof TRPCError) {
      // Only log non-client errors (skip UNAUTHORIZED, BAD_REQUEST, NOT_FOUND)
      const clientErrors = ["UNAUTHORIZED", "BAD_REQUEST", "NOT_FOUND", "FORBIDDEN"];
      if (!clientErrors.includes(error.code)) {
        console.error(`[tRPC Error] ${path} (${duration}ms):`, {
          code: error.code,
          message: error.message,
          userId: (ctx as any).user?.id,
        });
      }
      throw error;
    }

    // Unexpected error — log full details, return sanitized message
    console.error(`[Unexpected Error] ${path} (${duration}ms):`, {
      error: error instanceof Error ? error.stack : error,
      userId: (ctx as any).user?.id,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please try again.",
      cause: error,
    });
  }
});
