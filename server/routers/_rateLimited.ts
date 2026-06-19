/**
 * Rate-limited procedure variants for public form submissions and AI chat.
 * Import these instead of raw `publicProcedure` for any public mutation that
 * accepts user-generated content.
 */
import { publicProcedure } from "../_core/trpc";
import { formSubmissionLimiter, aiChatLimiter, generalPublicWriteLimiter } from "../middleware";

/** Rate-limited procedure for form submissions (5/IP/hour) */
export const rateLimitedFormProcedure = publicProcedure.use(formSubmissionLimiter);

/** Rate-limited procedure for AI chat (20/IP/hour) */
export const rateLimitedChatProcedure = publicProcedure.use(aiChatLimiter);

/** Rate-limited procedure for general public writes (10/IP/hour) */
export const rateLimitedPublicProcedure = publicProcedure.use(generalPublicWriteLimiter);
