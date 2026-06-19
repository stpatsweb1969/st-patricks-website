import { eq, desc } from "drizzle-orm";
import { massIntentions, type InsertMassIntention } from "../../drizzle/schema";
import { getDb } from "./_connection";

export async function createMassIntention(data: Omit<InsertMassIntention, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  await db!.insert(massIntentions).values(data);
}

export async function getMassIntentions(status?: string) {
  const db = await getDb();
  if (!status || status === "all") {
    return db!.select().from(massIntentions).orderBy(desc(massIntentions.createdAt));
  }
  return db!.select().from(massIntentions)
    .where(eq(massIntentions.status, status))
    .orderBy(desc(massIntentions.createdAt));
}

export async function updateMassIntentionStatus(
  id: number,
  updates: { status?: string; scheduledDate?: Date | null; scheduledMass?: string | null; adminNotes?: string | null }
) {
  const db = await getDb();
  await db!.update(massIntentions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(massIntentions.id, id));
}
