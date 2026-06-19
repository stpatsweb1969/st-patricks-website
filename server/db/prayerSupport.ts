import { eq, sql } from "drizzle-orm";
import { prayerSupport } from "../../drizzle/schema";
import type { InsertPrayerSupport } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== PRAYER SUPPORT ("I PRAYED FOR THIS") HELPERS =====

export async function addPrayerSupport(data: InsertPrayerSupport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(prayerSupport).values(data);
  return result[0].insertId;
}

export async function getPrayerSupportCount(intentionId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [row] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(prayerSupport)
    .where(eq(prayerSupport.intentionId, intentionId));
  return row?.count ?? 0;
}

export async function getPrayerSupportCounts(intentionIds: number[]) {
  const db = await getDb();
  if (!db || intentionIds.length === 0) return {};
  const rows = await db.select({
    intentionId: prayerSupport.intentionId,
    count: sql<number>`COUNT(*)`,
  })
    .from(prayerSupport)
    .where(sql`${prayerSupport.intentionId} IN (${sql.join(intentionIds.map(id => sql`${id}`), sql`, `)})`)
    .groupBy(prayerSupport.intentionId);
  
  const map: Record<number, number> = {};
  for (const row of rows) {
    map[row.intentionId] = row.count;
  }
  return map;
}

export async function hasUserPrayed(intentionId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const [row] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(prayerSupport)
    .where(sql`${prayerSupport.intentionId} = ${intentionId} AND ${prayerSupport.userId} = ${userId}`);
  return (row?.count ?? 0) > 0;
}
