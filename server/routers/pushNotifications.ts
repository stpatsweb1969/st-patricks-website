import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure } from "../routers/_helpers";
import { router } from "../_core/trpc";
import { getDb } from "../db/_connection";
import { pushSubscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "../_core/env";
import webpush from "web-push";

// Configure web-push with VAPID keys
if (ENV.vapidPublicKey && ENV.vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:stpatsweb1969@gmail.com",
    ENV.vapidPublicKey,
    ENV.vapidPrivateKey
  );
}

export const pushNotificationsRouter = router({
  /** Subscribe to push notifications */
  subscribe: publicProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
        categories: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Check if this endpoint already exists
      const [existing] = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint))
        .limit(1);
      if (existing) {
        // Update categories if provided
        if (input.categories) {
          await db.update(pushSubscriptions)
            .set({ categories: input.categories })
            .where(eq(pushSubscriptions.endpoint, input.endpoint));
        }
        return { success: true, message: "Already subscribed" };
      }
      await db.insert(pushSubscriptions).values({
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        userId: ctx.user?.openId ?? null,
        categories: input.categories || "mass_reminders,bulletin,closures,events,announcements",
      });
      return { success: true, message: "Subscribed to notifications" };
    }),

  /** Update notification categories for an existing subscription */
  updateCategories: publicProcedure
    .input(z.object({
      endpoint: z.string().url(),
      categories: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(pushSubscriptions)
        .set({ categories: input.categories })
        .where(eq(pushSubscriptions.endpoint, input.endpoint));
      return { success: true };
    }),

  /** Get categories for a subscription */
  getCategories: publicProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { categories: "mass_reminders,bulletin,closures,events,announcements" };
      const [sub] = await db.select({ categories: pushSubscriptions.categories })
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint))
        .limit(1);
      return { categories: sub?.categories || "mass_reminders,bulletin,closures,events,announcements" };
    }),

  /** Unsubscribe from push notifications */
  unsubscribe: publicProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint));
      return { success: true };
    }),

  /** Get subscription count (admin only) */
  getCount: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const all = await db.select().from(pushSubscriptions);
    return { count: all.length };
  }),

  /** Broadcast a custom announcement via push/email/banner (admin only) */
  broadcast: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        body: z.string().min(1).max(300),
        url: z.string().optional(),
        channels: z.object({
          push: z.boolean().default(true),
          email: z.boolean().default(false),
          banner: z.boolean().default(false),
        }).default({ push: true, email: false, banner: false }),
        segment: z.enum(["all", "bulletins", "news"]).default("all"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let pushSent = 0, pushFailed = 0, emailSent = 0;

      // Channel: Push notification
      if (input.channels.push) {
        const result = await sendPushToAll({
          title: input.title,
          body: input.body,
          url: input.url || "/",
          icon: "/favicon.ico",
        });
        pushSent = result.sent;
        pushFailed = result.failed;
      }

      // Channel: Email to subscriber list
      if (input.channels.email) {
        const { sendEmail } = await import("../email/index");
        const { getActiveSubscribers, getAllSubscriptions } = await import("../db/subscriptions");
        const subscribers = input.segment === "all"
          ? (await getAllSubscriptions()).filter(s => s.active)
          : await getActiveSubscribers(input.segment);
        for (const sub of subscribers) {
          const ok = await sendEmail(
            sub.email,
            input.title,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2>${input.title}</h2><p>${input.body}</p>${input.url ? `<p><a href="${input.url}">Read more &rarr;</a></p>` : ""}<hr/><p style="font-size:12px;color:#666;">St. Patrick's of Armonk</p></div>`
          );
          if (ok) emailSent++;
        }
      }

      // Channel: Homepage banner (marquee)
      if (input.channels.banner) {
        const { upsertSiteSetting } = await import("../db/admin");
        await upsertSiteSetting("marquee_text", input.body);
      }

      // Audit log
      try {
        const { createAuditLog } = await import("../db/auditLog");
        await createAuditLog({
          userId: ctx.user?.openId ?? "system",
          userName: ctx.user?.name ?? "System",
          action: "broadcast",
          entityType: "announcement",
          entityId: "broadcast",
          details: JSON.stringify({
            title: input.title,
            channels: input.channels,
            segment: input.segment,
            pushSent,
            emailSent,
          }),
        });
      } catch { /* non-critical */ }

      return { pushSent, pushFailed, emailSent };
    }),
});

/**
 * Send a push notification to subscribers.
 * If category is specified, only sends to subscribers who opted into that category.
 */
export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  category?: string;
}) {
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) {
    console.warn("[Push] VAPID keys not configured, skipping push");
    return { sent: 0, failed: 0 };
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Push] Database not available, skipping push");
    return { sent: 0, failed: 0 };
  }

  let subs = await db.select().from(pushSubscriptions);

  // Filter by category if specified
  if (payload.category) {
    subs = subs.filter(sub => {
      const cats = (sub.categories || "").split(",").map(c => c.trim());
      return cats.includes(payload.category!);
    });
  }

  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  for (const sub of subs) {
    const pushSub = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };
    try {
      await webpush.sendNotification(
        pushSub,
        JSON.stringify(payload)
      );
      sent++;
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        staleEndpoints.push(sub.endpoint);
      }
      failed++;
    }
  }

  // Clean up stale subscriptions
  for (const endpoint of staleEndpoints) {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
  }

  console.log(`[Push] Sent: ${sent}, Failed: ${failed}, Cleaned: ${staleEndpoints.length}`);
  return { sent, failed, cleaned: staleEndpoints.length };
}
