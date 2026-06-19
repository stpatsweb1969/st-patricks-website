/**
 * Saint Streak DB helpers — track daily saint-of-day visits for gamification.
 */
import { eq } from "drizzle-orm";
import { getDb } from "./_connection";
import { saintStreaks } from "../../drizzle/schema";

export async function getStreak(userId: string) {
  const db = (await getDb())!;
  const [row] = await db.select().from(saintStreaks).where(eq(saintStreaks.userId, userId)).limit(1);
  return row || null;
}

export async function recordVisit(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  totalVisits: number;
}> {
  const db = (await getDb())!;
  const today = getTodayEastern();
  const existing = await getStreak(userId);

  if (!existing) {
    // First ever visit
    await db.insert(saintStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastVisitDate: today,
      totalVisits: 1,
    });
    return { currentStreak: 1, longestStreak: 1, totalVisits: 1 };
  }

  // Already visited today
  if (existing.lastVisitDate === today) {
    return {
      currentStreak: existing.currentStreak,
      longestStreak: existing.longestStreak,
      totalVisits: existing.totalVisits,
    };
  }

  const yesterday = getYesterdayEastern();
  let newStreak: number;

  if (existing.lastVisitDate === yesterday) {
    // Consecutive day — extend streak
    newStreak = existing.currentStreak + 1;
  } else {
    // Streak broken — restart
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, existing.longestStreak);
  const newTotal = existing.totalVisits + 1;

  await db.update(saintStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastVisitDate: today,
      totalVisits: newTotal,
      updatedAt: new Date(),
    })
    .where(eq(saintStreaks.id, existing.id));

  return { currentStreak: newStreak, longestStreak: newLongest, totalVisits: newTotal };
}

function getTodayEastern(): string {
  const now = new Date();
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return formatDate(eastern);
}

function getYesterdayEastern(): string {
  const now = new Date();
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  eastern.setDate(eastern.getDate() - 1);
  return formatDate(eastern);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
