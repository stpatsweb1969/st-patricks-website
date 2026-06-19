import { eq, desc } from "drizzle-orm";
import { newsPosts } from "../../drizzle/schema";
import type { InsertNewsPost } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== NEWS POSTS =====

export async function createNewsPost(data: Omit<InsertNewsPost, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(newsPosts).values(data);
  return result[0].insertId;
}

export async function updateNewsPost(id: number, data: Partial<InsertNewsPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(newsPosts).set(data).where(eq(newsPosts.id, id));
}

export async function deleteNewsPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(newsPosts).where(eq(newsPosts.id, id));
}

export async function getPublishedNewsPosts(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsPosts)
    .where(eq(newsPosts.published, true))
    .orderBy(desc(newsPosts.publishedAt))
    .limit(limit);
}

export async function getAllNewsPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsPosts).orderBy(desc(newsPosts.createdAt));
}

export async function getNewsPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(newsPosts).where(eq(newsPosts.id, id)).limit(1);
  return result[0];
}
