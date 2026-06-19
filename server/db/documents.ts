import { eq, desc, and } from "drizzle-orm";
import { parishDocuments } from "../../drizzle/schema";
import type { InsertParishDocument } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== PARISH DOCUMENTS =====

export async function getDocuments(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(parishDocuments)
      .where(eq(parishDocuments.category, category))
      .orderBy(desc(parishDocuments.createdAt));
  }
  return db.select().from(parishDocuments).orderBy(desc(parishDocuments.createdAt));
}

export async function createDocument(data: Omit<InsertParishDocument, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(parishDocuments).values(data);
  return result[0].insertId;
}

export async function updateDocument(id: number, data: Partial<InsertParishDocument>) {
  const db = await getDb();
  if (!db) return;
  await db.update(parishDocuments).set(data).where(eq(parishDocuments.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(parishDocuments).where(eq(parishDocuments.id, id));
}

export async function getDocumentsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parishDocuments)
    .where(and(eq(parishDocuments.category, category), eq(parishDocuments.published, true)))
    .orderBy(parishDocuments.sortOrder);
}

export async function getAllDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parishDocuments).orderBy(parishDocuments.category, parishDocuments.sortOrder);
}
