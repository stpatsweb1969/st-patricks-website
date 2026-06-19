import { eq, desc, and, sql } from "drizzle-orm";
import { volunteerOpportunities, volunteerSignups } from "../../drizzle/schema";
import type { InsertVolunteerOpportunity, InsertVolunteerSignup } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== VOLUNTEER HELPERS =====

export async function createVolunteerOpportunity(data: InsertVolunteerOpportunity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(volunteerOpportunities).values(data);
  return result[0].insertId;
}

export async function getVolunteerOpportunities(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return db.select().from(volunteerOpportunities)
      .where(eq(volunteerOpportunities.active, true))
      .orderBy(volunteerOpportunities.eventDate);
  }
  return db.select().from(volunteerOpportunities).orderBy(desc(volunteerOpportunities.createdAt));
}

export async function updateVolunteerOpportunity(id: number, data: Partial<InsertVolunteerOpportunity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(volunteerOpportunities).set(data).where(eq(volunteerOpportunities.id, id));
}

export async function deleteVolunteerOpportunity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(volunteerSignups).where(eq(volunteerSignups.opportunityId, id));
  await db.delete(volunteerOpportunities).where(eq(volunteerOpportunities.id, id));
}

export async function createVolunteerSignup(data: InsertVolunteerSignup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(volunteerSignups).values(data);
  await db.update(volunteerOpportunities)
    .set({ spotsFilled: sql`spotsFilled + 1` })
    .where(eq(volunteerOpportunities.id, data.opportunityId));
  return result[0].insertId;
}

export async function getVolunteerSignups(opportunityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(volunteerSignups)
    .where(and(eq(volunteerSignups.opportunityId, opportunityId), eq(volunteerSignups.status, "confirmed")))
    .orderBy(desc(volunteerSignups.createdAt));
}

export async function cancelVolunteerSignup(id: number, opportunityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(volunteerSignups).set({ status: "cancelled" }).where(eq(volunteerSignups.id, id));
  await db.update(volunteerOpportunities)
    .set({ spotsFilled: sql`GREATEST(spotsFilled - 1, 0)` })
    .where(eq(volunteerOpportunities.id, opportunityId));
}
