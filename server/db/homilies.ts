import { getDb } from "./_connection";
import { homilies } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";

export async function getPublishedHomilies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(homilies).where(eq(homilies.published, true)).orderBy(desc(homilies.date));
}

export async function getAllHomilies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(homilies).orderBy(desc(homilies.date));
}

export async function createHomily(data: {
  title: string;
  date: Date;
  celebrant?: string;
  topic?: string;
  audioUrl?: string;
  audioKey?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(homilies).values(data);
  return result.insertId;
}

export async function deleteHomily(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(homilies).where(eq(homilies.id, id));
}

export async function updateHomily(id: number, data: Partial<{
  title: string;
  date: Date;
  celebrant: string | null;
  topic: string | null;
  audioUrl: string | null;
  audioKey: string | null;
  notes: string | null;
  published: boolean;
}>) {
  const db = await getDb();
  if (!db) return;
  await db.update(homilies).set(data).where(eq(homilies.id, id));
}
