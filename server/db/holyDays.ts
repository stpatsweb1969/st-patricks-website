import { eq, gte, asc, desc } from "drizzle-orm";
import { getDb } from "./_connection";
import { holyDays, type InsertHolyDay } from "../../drizzle/schema";

/** Get all holy days (admin view), ordered by date descending */
export async function getAllHolyDays() {
  const db = await getDb();
  return db!.select().from(holyDays).orderBy(desc(holyDays.date));
}

/** Get upcoming holy days (date >= today), ordered by date ascending */
export async function getUpcomingHolyDays(limit = 10) {
  const db = await getDb();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return db!
    .select()
    .from(holyDays)
    .where(gte(holyDays.date, today))
    .orderBy(asc(holyDays.date))
    .limit(limit);
}

/** Upsert a holy day (create or update) */
export async function upsertHolyDay(data: Omit<InsertHolyDay, "id" | "createdAt" | "updatedAt"> & { id?: number }) {
  const db = await getDb();
  if (data.id) {
    const { id, ...rest } = data;
    await db!.update(holyDays).set(rest).where(eq(holyDays.id, id));
    return { id };
  }
  const [result] = await db!.insert(holyDays).values(data as InsertHolyDay);
  return { id: result.insertId };
}

/** Delete a holy day by ID */
export async function deleteHolyDay(id: number) {
  const db = await getDb();
  await db!.delete(holyDays).where(eq(holyDays.id, id));
}
