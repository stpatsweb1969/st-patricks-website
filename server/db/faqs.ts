/**
 * FAQ Database Helpers — CRUD for parish FAQ knowledge base.
 */
import { eq, asc } from "drizzle-orm";
import { parishFaqs } from "../../drizzle/schema";
import { getDb } from "./_connection";

export async function getActiveFaqs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parishFaqs).where(eq(parishFaqs.active, true)).orderBy(asc(parishFaqs.sortOrder));
}

export async function getAllFaqs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parishFaqs).orderBy(asc(parishFaqs.sortOrder));
}

export async function createFaq(data: { question: string; answer: string; category?: string; sortOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.insert(parishFaqs).values({
    question: data.question,
    answer: data.answer,
    category: data.category || "general",
    sortOrder: data.sortOrder || 0,
  });
}

export async function updateFaq(id: number, data: { question?: string; answer?: string; category?: string; sortOrder?: number; active?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.update(parishFaqs).set(data).where(eq(parishFaqs.id, id));
}

export async function deleteFaq(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.delete(parishFaqs).where(eq(parishFaqs.id, id));
}
