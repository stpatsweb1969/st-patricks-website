/**
 * Email notification helpers for news, bulletins, and CCD reminders.
 * Extracted from routers.ts for maintainability.
 * ~160 lines
 */
import { ENV } from "./_core/env";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

/**
 * Sends an email notification to a single subscriber using the Forge Notification API.
 */
async function sendEmailToSubscriber(
  email: string,
  subject: string,
  htmlBody: string
): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Notifications] Forge API not configured, skipping email send");
    return false;
  }

  try {
    const normalizedBase = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
    const endpoint = new URL("webdevtoken.v1.WebDevService/SendEmailNotification", normalizedBase).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: email,
        subject,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      console.warn(`[Notifications] Email send failed for ${email}: ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[Notifications] Email send error for ${email}:`, error);
    return false;
  }
}

/**
 * Sends email notifications to all active news subscribers when a post is published.
 */
export async function sendNewsNotifications(postId: number, title: string, excerpt: string) {
  try {
    const subscribers = await db.getActiveSubscribers("news");
    if (subscribers.length === 0) return;

    const subscriberCount = subscribers.length;
    let sentCount = 0;

    for (const subscriber of subscribers) {
      const unsubscribeUrl = `/unsubscribe?token=${subscriber.unsubscribeToken}`;
      const htmlBody = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1a5c2e;">
            <h1 style="color: #1a5c2e; margin: 0; font-size: 24px;">St. Patrick in Armonk</h1>
            <p style="color: #666; margin: 5px 0 0; font-size: 12px;">Armonk, New York</p>
          </div>
          <div style="padding: 30px 0;">
            <h2 style="color: #333; font-size: 20px;">${title}</h2>
            <p style="color: #555; line-height: 1.6; font-size: 15px;">${excerpt}</p>
            <p style="margin-top: 20px;"><a href="/news" style="background: #1a5c2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Read More</a></p>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
            <p style="color: #999; font-size: 11px;">St. Patrick in Armonk | 29 Cox Ave, Armonk NY 10504</p>
            <p style="color: #999; font-size: 11px;"><a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe from these emails</a></p>
          </div>
        </div>
      `;

      const sent = await sendEmailToSubscriber(
        subscriber.email,
        `St. Patrick in Armonk: ${title}`,
        htmlBody
      );
      if (sent) sentCount++;
    }

    await notifyOwner({
      title: `New News Post Published: "${title}"`,
      content: `"${title}" has been published. ${sentCount}/${subscriberCount} subscriber email(s) sent successfully.`,
    });

    console.log(`[Notifications] News notification: ${sentCount}/${subscriberCount} emails sent for "${title}"`);
  } catch (error) {
    console.error("[Notifications] Failed to send news notifications:", error);
  }
}

/**
 * Sends email notifications to all active bulletin subscribers when a bulletin is published.
 */
export async function sendBulletinNotifications(bulletinId: number, title: string) {
  try {
    const subscribers = await db.getActiveSubscribers("bulletins");
    if (subscribers.length === 0) return;

    const subscriberCount = subscribers.length;
    let sentCount = 0;

    for (const subscriber of subscribers) {
      const unsubscribeUrl = `/unsubscribe?token=${subscriber.unsubscribeToken}`;
      const htmlBody = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1a5c2e;">
            <h1 style="color: #1a5c2e; margin: 0; font-size: 24px;">St. Patrick in Armonk</h1>
            <p style="color: #666; margin: 5px 0 0; font-size: 12px;">Armonk, New York</p>
          </div>
          <div style="padding: 30px 0;">
            <h2 style="color: #333; font-size: 20px;">New Weekly Bulletin</h2>
            <p style="color: #555; line-height: 1.6; font-size: 15px;">The latest parish bulletin "${title}" is now available. View or download it from our website.</p>
            <p style="margin-top: 20px;"><a href="/bulletins" style="background: #1a5c2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Bulletin</a></p>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
            <p style="color: #999; font-size: 11px;">St. Patrick in Armonk | 29 Cox Ave, Armonk NY 10504</p>
            <p style="color: #999; font-size: 11px;"><a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe from these emails</a></p>
          </div>
        </div>
      `;

      const sent = await sendEmailToSubscriber(
        subscriber.email,
        `St. Patrick in Armonk: New Bulletin - ${title}`,
        htmlBody
      );
      if (sent) sentCount++;
    }

    await notifyOwner({
      title: `New Bulletin Published: "${title}"`,
      content: `"${title}" has been published. ${sentCount}/${subscriberCount} subscriber email(s) sent successfully.`,
    });

    console.log(`[Notifications] Bulletin notification: ${sentCount}/${subscriberCount} emails sent for "${title}"`);
  } catch (error) {
    console.error("[Notifications] Failed to send bulletin notifications:", error);
  }
}

/**
 * Sends CCD class reminder emails to all opted-in parents for upcoming events.
 */
export async function sendCcdReminders(events: Array<{ id: number; title: string; eventDate: Date; eventType: string; grade: string | null; location: string | null }>) {
  try {
    const parents = await db.getCcdReminderParents();
    if (parents.length === 0) return { sent: 0, total: 0 };

    let sentCount = 0;
    for (const parent of parents) {
      const relevantEvents = events.filter(e => !e.grade || e.grade === "All" || e.grade === parent.grade);
      if (relevantEvents.length === 0) continue;

      const eventListHtml = relevantEvents.map(e => {
        const dateStr = new Date(e.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
        return `<li style="margin-bottom: 8px;"><strong>${e.title}</strong> — ${dateStr}${e.location ? ` at ${e.location}` : ""}</li>`;
      }).join("");

      const unsubscribeUrl = `/ccd-unsubscribe?token=${parent.unsubscribeToken}`;
      const htmlBody = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #1a5c2e;">
            <h1 style="color: #1a5c2e; margin: 0; font-size: 24px;">St. Patrick in Armonk</h1>
            <p style="color: #666; margin: 5px 0 0; font-size: 12px;">Religious Education Reminder</p>
          </div>
          <div style="padding: 30px 0;">
            <p style="color: #333; font-size: 16px;">Dear ${parent.parentFirstName},</p>
            <p style="color: #555; line-height: 1.6; font-size: 15px;">This is a reminder about upcoming CCD activities for <strong>${parent.childFirstName}</strong> (Grade ${parent.grade}):</p>
            <ul style="color: #555; line-height: 1.8; font-size: 14px;">${eventListHtml}</ul>
            <p style="margin-top: 20px;"><a href="/ccd-calendar" style="background: #1a5c2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Calendar</a></p>
          </div>
          <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
            <p style="color: #999; font-size: 11px;">St. Patrick in Armonk | 29 Cox Ave, Armonk NY 10504</p>
            <p style="color: #999; font-size: 11px;"><a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe from CCD reminders</a></p>
          </div>
        </div>
      `;

      const sent = await sendEmailToSubscriber(
        parent.parentEmail,
        `CCD Reminder: Upcoming Class for ${parent.childFirstName}`,
        htmlBody
      );
      if (sent) sentCount++;
    }

    console.log(`[CCD Reminders] ${sentCount}/${parents.length} reminder emails sent`);
    return { sent: sentCount, total: parents.length };
  } catch (error) {
    console.error("[CCD Reminders] Failed to send reminders:", error);
    return { sent: 0, total: 0 };
  }
}
