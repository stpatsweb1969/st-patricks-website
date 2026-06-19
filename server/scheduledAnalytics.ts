/**
 * Monday Morning Analytics Digest — sends a weekly analytics summary
 * to the site owner every Monday at 8 AM ET (12:00 UTC).
 * Called by Heartbeat cron at /api/scheduled/analytics-digest
 */
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

/**
 * Gather analytics data from the database.
 */
async function gatherWeeklyAnalytics() {
  // Admin stats gives us totals and pending counts
  const stats = await db.getAdminStats();

  // Recent form submissions (last 15) to count this week's
  const recentForms = await db.getRecentFormSubmissions(50);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekForms = recentForms.filter(
    (f: any) => new Date(f.createdAt) >= sevenDaysAgo
  );

  // Upcoming events
  const upcomingEvents = await db.getUpcomingEvents(7);

  // Recent bulletins
  const bulletins = await db.getPublishedBulletins(5);
  const thisWeekBulletins = bulletins.filter(
    (b: any) => new Date(b.createdAt) >= sevenDaysAgo
  );

  // Recent news
  const news = await db.getPublishedNewsPosts(10);
  const thisWeekNews = news.filter(
    (n: any) => new Date(n.createdAt) >= sevenDaysAgo
  );

  // Prayer intentions this week
  const prayerCount = await db.getPrayerIntentionCount();

  return { stats, thisWeekForms, upcomingEvents, thisWeekBulletins, thisWeekNews, prayerCount };
}

/**
 * Build the analytics digest content for notifyOwner.
 */
function buildAnalyticsContent(data: Awaited<ReturnType<typeof gatherWeeklyAnalytics>>): string {
  const lines: string[] = [];
  const today = new Date();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dateRange = `${weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  lines.push(`📊 Weekly Analytics Digest (${dateRange})\n`);

  // Form submissions this week
  const formCount = data.thisWeekForms.length;
  lines.push(`📝 Form Submissions This Week: ${formCount}`);
  if (formCount > 0) {
    // Group by type
    const byType: Record<string, number> = {};
    for (const f of data.thisWeekForms) {
      const type = (f as any).type || "other";
      byType[type] = (byType[type] || 0) + 1;
    }
    for (const [type, count] of Object.entries(byType)) {
      const label = type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      lines.push(`  • ${label}: ${count}`);
    }
  }
  lines.push("");

  // Pending items needing attention
  lines.push("⚠️ Pending Items (need review):");
  if (data.stats.pendingBaptisms > 0) lines.push(`  • Baptism registrations: ${data.stats.pendingBaptisms}`);
  if (data.stats.pendingMarriages > 0) lines.push(`  • Marriage inquiries: ${data.stats.pendingMarriages}`);
  if (data.stats.pendingParishRegistrations > 0) lines.push(`  • Parish registrations: ${data.stats.pendingParishRegistrations}`);
  if (data.stats.pendingCcdRegistrations > 0) lines.push(`  • CCD registrations: ${data.stats.pendingCcdRegistrations}`);
  if (data.stats.pendingTeenLife > 0) lines.push(`  • Teen Life registrations: ${data.stats.pendingTeenLife}`);
  const hasPending = data.stats.pendingBaptisms + data.stats.pendingMarriages +
    data.stats.pendingParishRegistrations + data.stats.pendingCcdRegistrations + data.stats.pendingTeenLife;
  if (hasPending === 0) lines.push("  ✓ All caught up!");
  lines.push("");

  // Subscribers
  lines.push(`👥 Active Subscribers: ${data.stats.activeSubscribers}`);
  lines.push("");

  // Content published this week
  lines.push("📰 Published This Week:");
  lines.push(`  • Bulletins: ${data.thisWeekBulletins.length}`);
  lines.push(`  • News posts: ${data.thisWeekNews.length}`);
  lines.push("");

  // Upcoming events
  lines.push(`📅 Events This Week: ${data.upcomingEvents.length}`);
  if (data.upcomingEvents.length > 0) {
    for (const e of data.upcomingEvents.slice(0, 5)) {
      const dateStr = new Date(e.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      lines.push(`  • ${e.title} — ${dateStr}`);
    }
    if (data.upcomingEvents.length > 5) lines.push(`  ... and ${data.upcomingEvents.length - 5} more`);
  }
  lines.push("");

  // Prayer wall
  lines.push(`🙏 Prayer Intentions (last 7 days): ${data.prayerCount}`);
  lines.push("");

  // Site totals
  lines.push("📈 Site Totals:");
  lines.push(`  • News posts: ${data.stats.totalNews}`);
  lines.push(`  • Events: ${data.stats.totalEvents}`);
  lines.push(`  • Gallery photos: ${data.stats.totalGalleryPhotos}`);
  lines.push(`  • Volunteer signups: ${data.stats.totalVolunteerSignups}`);
  lines.push("");

  lines.push("💡 Check PostHog for page views, chatbot usage, and user journeys.");

  return lines.join("\n");
}

/**
 * Main analytics digest handler — called by Heartbeat cron.
 */
export async function handleAnalyticsDigest(): Promise<{ sent: boolean; summary: string }> {
  const data = await gatherWeeklyAnalytics();
  const content = buildAnalyticsContent(data);

  const sent = await notifyOwner({
    title: "📊 Monday Analytics Digest",
    content,
  });

  return { sent, summary: content };
}
