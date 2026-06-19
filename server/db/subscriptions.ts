import { eq, desc, and } from "drizzle-orm";
import { emailSubscriptions } from "../../drizzle/schema";
import type { InsertEmailSubscription } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== EMAIL SUBSCRIPTIONS =====

export async function createSubscription(data: Omit<InsertEmailSubscription, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailSubscriptions).values(data);
  return result[0].insertId;
}

export async function getSubscriptionByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailSubscriptions).where(eq(emailSubscriptions.email, email)).limit(1);
  return result[0];
}

export async function getActiveSubscribers(type: "bulletins" | "news") {
  const db = await getDb();
  if (!db) return [];
  if (type === "bulletins") {
    return db.select().from(emailSubscriptions)
      .where(and(eq(emailSubscriptions.active, true), eq(emailSubscriptions.subscribedToBulletins, true)));
  }
  return db.select().from(emailSubscriptions)
    .where(and(eq(emailSubscriptions.active, true), eq(emailSubscriptions.subscribedToNews, true)));
}

export async function unsubscribeByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailSubscriptions)
    .set({ active: false })
    .where(eq(emailSubscriptions.unsubscribeToken, token));
}

export async function getAllSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSubscriptions).orderBy(desc(emailSubscriptions.createdAt));
}
