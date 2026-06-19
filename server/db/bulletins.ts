import { eq, desc, isNull, isNotNull, and } from "drizzle-orm";
import { bulletins } from "../../drizzle/schema";
import type { InsertBulletin } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== BULLETINS =====

export async function createBulletin(data: Omit<InsertBulletin, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bulletins).values(data);
  return result[0].insertId;
}

export async function updateBulletin(id: number, data: Partial<InsertBulletin>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bulletins).set(data).where(eq(bulletins.id, id));
}

/** Soft-delete: sets deletedAt timestamp instead of removing the row */
export async function deleteBulletin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bulletins).set({ deletedAt: new Date() }).where(eq(bulletins.id, id));
}

/** Restore a soft-deleted bulletin */
export async function restoreBulletin(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bulletins).set({ deletedAt: null }).where(eq(bulletins.id, id));
}

/** Get recently deleted bulletins (for admin restore UI) */
export async function getDeletedBulletins() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bulletins)
    .where(isNotNull(bulletins.deletedAt))
    .orderBy(desc(bulletins.deletedAt));
}

export async function getPublishedBulletins() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bulletins)
    .where(and(eq(bulletins.published, true), isNull(bulletins.deletedAt)))
    .orderBy(desc(bulletins.weekDate));
}

export async function getAllBulletins() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bulletins)
    .where(isNull(bulletins.deletedAt))
    .orderBy(desc(bulletins.weekDate));
}

export async function getBulletinById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bulletins).where(eq(bulletins.id, id)).limit(1);
  return result[0];
}
