/**
 * Section-based Notification Routing.
 * Routes form submissions to the department alias that owns the section,
 * always BCC'ing the catch-all. Falls back to catch-all when unmapped.
 * A routing failure never blocks the form submission.
 */
import { getSiteSetting } from "../db";
import { sendEmail } from "../email";
import { notifyOwner } from "../_core/notification";
import type { AdminSection } from "../../shared/roles";

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationRouting = {
  catchall: string;
  bySection: Partial<Record<AdminSection, string>>;
};

// ─── Default seed (from parish's existing aliases) ──────────────────────────

export const DEFAULT_NOTIFICATION_ROUTING: NotificationRouting = {
  catchall: "stpatsweb1969@gmail.com",
  bySection: {
    sacraments: "stpatsweb1969@gmail.com",
    ccd_registrations: "stpatsweb1969@gmail.com",
    ccd_permissions: "stpatsweb1969@gmail.com",
    teen_life: "stpatsweb1969@gmail.com",
    cyo: "stpatsweb1969@gmail.com",
    volunteers: "stpatsweb1969@gmail.com",
    registrations: "stpatsweb1969@gmail.com",
  },
};

const ROUTING_KEY = "notification_routing";

// ─── Load routing config ────────────────────────────────────────────────────

export async function getRoutingConfig(): Promise<NotificationRouting> {
  try {
    const raw = await getSiteSetting(ROUTING_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_ROUTING;
    return JSON.parse(raw) as NotificationRouting;
  } catch {
    return DEFAULT_NOTIFICATION_ROUTING;
  }
}

// ─── Save routing config ────────────────────────────────────────────────────

export async function saveRoutingConfig(config: NotificationRouting): Promise<void> {
  const { upsertSiteSetting } = await import("../db");
  await upsertSiteSetting(ROUTING_KEY, JSON.stringify(config));
}

// ─── Main routing function ──────────────────────────────────────────────────

export async function routeNotification(
  section: AdminSection,
  payload: { title: string; content: string }
): Promise<void> {
  try {
    const config = await getRoutingConfig();
    const to = config.bySection[section] || config.catchall;
    const bcc = to !== config.catchall ? config.catchall : undefined;

    // Build a simple HTML email body
    const htmlBody = `
      <h2 style="margin:0 0 16px;color:#1a5c2e;">${payload.title}</h2>
      <div style="white-space:pre-wrap;line-height:1.6;">${payload.content}</div>
    `;

    // Send to the section recipient
    await sendEmail(to, `[St. Patrick] ${payload.title}`, htmlBody);

    // BCC the catch-all separately (sendEmail doesn't support BCC natively)
    if (bcc) {
      await sendEmail(bcc, `[St. Patrick] ${payload.title}`, htmlBody);
    }
  } catch (error) {
    // Routing failure must never block the form submission
    console.error("[NotificationRouting] Failed to route notification:", error);
  }

  // Always also notify the Manus owner channel (belt-and-suspenders)
  try {
    await notifyOwner(payload);
  } catch (error) {
    console.error("[NotificationRouting] notifyOwner fallback failed:", error);
  }
}
