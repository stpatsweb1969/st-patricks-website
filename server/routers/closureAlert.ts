/**
 * Closure Alert Router — Admin one-tap severe weather / emergency closure system.
 * Uses siteSettings table (key: "closure_alert") to store the active alert.
 * When activated, sends VAPID push to all subscribers and shows a banner site-wide.
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { adminProcedure } from "./_helpers";
import * as db from "../db";
import { sendPushToAll } from "./pushNotifications";
import { notifyOwner } from "../_core/notification";
import { createAuditLog } from "../db/auditLog";

const CLOSURE_KEY = "closure_alert";

export interface ClosureAlert {
  active: boolean;
  type: "weather" | "emergency" | "custom";
  title: string;
  message: string;
  activatedAt: number; // Unix timestamp ms
  activatedBy: string; // user openId
}

const defaultAlert: ClosureAlert = {
  active: false,
  type: "weather",
  title: "",
  message: "",
  activatedAt: 0,
  activatedBy: "",
};

export const closureAlertRouter = router({
  /** Get current closure alert status (public) */
  get: publicProcedure.query(async () => {
    const raw = await db.getSiteSetting(CLOSURE_KEY);
    if (!raw) return defaultAlert;
    try {
      return JSON.parse(raw) as ClosureAlert;
    } catch {
      return defaultAlert;
    }
  }),

  /** Activate a closure alert (admin only) */
  activate: adminProcedure
    .input(
      z.object({
        type: z.enum(["weather", "emergency", "custom"]),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const alert: ClosureAlert = {
        active: true,
        type: input.type,
        title: input.title,
        message: input.message,
        activatedAt: Date.now(),
        activatedBy: ctx.user.openId,
      };

      await db.upsertSiteSetting(CLOSURE_KEY, JSON.stringify(alert));

      // Send push notification to all subscribers
      const pushResult = await sendPushToAll({
        title: `⚠️ ${input.title}`,
        body: input.message,
        url: "/",
        icon: "/favicon.ico",
      });

      // Notify owner
      await notifyOwner({
        title: `Closure Alert Activated: ${input.title}`,
        content: `Type: ${input.type}\nMessage: ${input.message}\nPush sent to ${pushResult.sent} subscribers.`,
      });

      // Audit log
      await createAuditLog({
        userId: ctx.user.openId,
        userName: ctx.user.name || undefined,
        action: "activate",
        entityType: "closure_alert",
        details: JSON.stringify({ type: input.type, title: input.title }),
      });
      return { success: true, pushSent: pushResult.sent };
    }),

  /** Deactivate the closure alert (admin only) */
  deactivate: adminProcedure.mutation(async ({ ctx }) => {
    const raw = await db.getSiteSetting(CLOSURE_KEY);
    let previous: ClosureAlert = defaultAlert;
    if (raw) {
      try { previous = JSON.parse(raw); } catch {}
    }

    await db.upsertSiteSetting(CLOSURE_KEY, JSON.stringify(defaultAlert));

    // Notify owner
    await notifyOwner({
      title: "Closure Alert Deactivated",
      content: `Previous alert "${previous.title}" has been cleared.`,
    });

    // Audit log
    await createAuditLog({
      userId: ctx.user.openId,
      userName: ctx.user.name || undefined,
      action: "deactivate",
      entityType: "closure_alert",
      details: JSON.stringify({ previousTitle: previous.title }),
    });
    return { success: true };
  }),
});
