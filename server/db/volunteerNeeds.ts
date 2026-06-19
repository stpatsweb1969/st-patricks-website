import { eq, desc, sql } from "drizzle-orm";
import { volunteerNeeds, volunteerNeedResponses } from "../../drizzle/schema";
import type { InsertVolunteerNeed, InsertVolunteerNeedResponse } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== VOLUNTEER NEEDS BOARD HELPERS =====

export async function getActiveVolunteerNeeds() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(volunteerNeeds)
    .where(eq(volunteerNeeds.active, true))
    .orderBy(desc(volunteerNeeds.createdAt));
}

export async function getAllVolunteerNeeds() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(volunteerNeeds)
    .orderBy(desc(volunteerNeeds.createdAt));
}

export async function createVolunteerNeed(data: InsertVolunteerNeed) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(volunteerNeeds).values(data);
  return result[0].insertId;
}

export async function updateVolunteerNeed(id: number, data: Partial<InsertVolunteerNeed>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(volunteerNeeds).set(data).where(eq(volunteerNeeds.id, id));
}

export async function getVolunteerNeedResponses(needId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(volunteerNeedResponses)
    .where(eq(volunteerNeedResponses.needId, needId))
    .orderBy(desc(volunteerNeedResponses.createdAt));
}

export async function createVolunteerNeedResponse(data: InsertVolunteerNeedResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(volunteerNeedResponses).values(data);
  // Increment spots filled
  await db.update(volunteerNeeds)
    .set({ spotsFilled: sql`spotsFilled + 1` })
    .where(eq(volunteerNeeds.id, data.needId));
  return result[0].insertId;
}
