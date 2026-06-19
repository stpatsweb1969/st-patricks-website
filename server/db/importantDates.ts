import { eq, desc, gte, and } from "drizzle-orm";
import { importantDates } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== IMPORTANT DATES =====

export async function getUpcomingImportantDates(limit = 12) {
  const db = await getDb();
  const now = new Date();
  return db!.select().from(importantDates)
    .where(and(
      eq(importantDates.published, true),
      gte(importantDates.eventDate, now)
    ))
    .orderBy(importantDates.eventDate)
    .limit(limit);
}

export async function getAllPublishedImportantDates() {
  const db = await getDb();
  return db!.select().from(importantDates)
    .where(eq(importantDates.published, true))
    .orderBy(importantDates.eventDate);
}

export async function getAllImportantDates() {
  const db = await getDb();
  return db!.select().from(importantDates).orderBy(importantDates.eventDate);
}

export async function createImportantDate(data: {
  title: string;
  eventDate: Date;
  location?: string | null;
  note?: string | null;
  category: "ccd" | "cyo" | "sacrament" | "parish" | "teen_life" | "social";
  published?: boolean;
}) {
  const db = await getDb();
  const [result] = await db!.insert(importantDates).values({
    title: data.title,
    eventDate: data.eventDate,
    location: data.location ?? null,
    note: data.note ?? null,
    category: data.category,
    published: data.published ?? true,
  });
  return result.insertId;
}

export async function updateImportantDate(id: number, data: {
  title?: string;
  eventDate?: Date;
  location?: string | null;
  note?: string | null;
  category?: "ccd" | "cyo" | "sacrament" | "parish" | "teen_life" | "social";
  published?: boolean;
}) {
  const db = await getDb();
  await db!.update(importantDates).set(data).where(eq(importantDates.id, id));
}

export async function deleteImportantDate(id: number) {
  const db = await getDb();
  await db!.delete(importantDates).where(eq(importantDates.id, id));
}
