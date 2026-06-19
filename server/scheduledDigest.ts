/**
 * Weekly Digest Handler — generates and sends a weekly email digest
 * to all active subscribers with this week's highlights.
 * Called by Heartbeat cron at /api/scheduled/weekly-digest
 * ~120 lines
 */
import { ENV } from "./_core/env";
import * as db from "./db";


/**
 * Sends an email notification to a single subscriber using the Forge Notification API.
 */
async function sendEmailToSubscriber(email: string, subject: string, htmlBody: string): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) return false;
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
      body: JSON.stringify({ to: email, subject, html: htmlBody }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Build the weekly digest email HTML.
 */
function buildDigestHtml(data: {
  events: Array<{ title: string; eventDate: Date; location?: string | null }>;
  news: Array<{ title: string; excerpt: string }>;
  bulletin?: { title: string; weekDate: Date } | null;
  unsubscribeToken: string;
}): string {
  const { events, news, bulletin, unsubscribeToken } = data;

  const eventsHtml = events.length > 0
    ? events.map(e => {
        const dateStr = new Date(e.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
        return `<li style="margin-bottom:8px;"><strong>${e.title}</strong> — ${dateStr}${e.location ? ` at ${e.location}` : ""}</li>`;
      }).join("")
    : `<p style="color:#888;">No upcoming events this week.</p>`;

  const newsHtml = news.length > 0
    ? news.map(n => `<li style="margin-bottom:8px;"><strong>${n.title}</strong> — ${n.excerpt}</li>`).join("")
    : "";

  const bulletinHtml = bulletin
    ? `<p style="margin-top:15px;"><a href="/bulletins" style="background:#1a5c2e;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">📄 View This Week's Bulletin</a></p>`
    : "";

  return `
    <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;padding:20px 0;border-bottom:2px solid #1a5c2e;">
        <h1 style="color:#1a5c2e;margin:0;font-size:24px;">St. Patrick in Armonk</h1>
        <p style="color:#666;margin:5px 0 0;font-size:14px;">Your Weekly Parish Digest</p>
      </div>
      <div style="padding:25px 0;">
        <h2 style="color:#1a5c2e;font-size:18px;margin-bottom:12px;">📅 This Week at St. Patrick's</h2>
        <ul style="color:#555;line-height:1.8;font-size:14px;padding-left:20px;">${eventsHtml}</ul>
        ${newsHtml ? `<h2 style="color:#1a5c2e;font-size:18px;margin-top:25px;margin-bottom:12px;">📰 Parish News</h2><ul style="color:#555;line-height:1.8;font-size:14px;padding-left:20px;">${newsHtml}</ul>` : ""}
        ${bulletinHtml}
      </div>
      <div style="border-top:1px solid #eee;padding-top:15px;text-align:center;">
        <p style="color:#999;font-size:11px;">St. Patrick in Armonk | 29 Cox Ave, Armonk NY 10504</p>
        <p style="color:#999;font-size:11px;"><a href="/unsubscribe?token=${unsubscribeToken}" style="color:#999;">Unsubscribe</a></p>
      </div>
    </div>
  `;
}

/**
 * Main digest handler — called by the Heartbeat cron.
 */
export async function handleWeeklyDigest(): Promise<{ sent: number; total: number }> {
  // Get this week's data
  const rawEvents = await db.getUpcomingEvents(7);
  const events = rawEvents.map(e => ({ title: e.title, eventDate: e.startDate, location: e.location }));
  const allNews = await db.getPublishedNewsPosts(3);
  const bulletins = await db.getPublishedBulletins(1);
  const latestBulletin = bulletins[0] || null;

  const news = allNews.map(n => ({
    title: n.title,
    excerpt: n.excerpt || n.content?.substring(0, 100) || "",
  }));

  // Get all active subscribers (both news and bulletin subscribers get the digest)
  const bulletinSubs = await db.getActiveSubscribers("bulletins");
  const newsSubs = await db.getActiveSubscribers("news");

  // Deduplicate by email
  const allEmails = new Map<string, string>();
  for (const s of [...bulletinSubs, ...newsSubs]) {
    allEmails.set(s.email, s.unsubscribeToken);
  }

  if (allEmails.size === 0) return { sent: 0, total: 0 };

  let sentCount = 0;
  const today = new Date();
  const subject = `St. Patrick's Weekly Digest — ${today.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;

  for (const [email, token] of Array.from(allEmails.entries())) {
    const html = buildDigestHtml({ events, news, bulletin: latestBulletin, unsubscribeToken: token });
    const sent = await sendEmailToSubscriber(email, subject, html);
    if (sent) sentCount++;
  }

  return { sent: sentCount, total: allEmails.size };
}
