import { eq, desc, and, gte, lte } from "drizzle-orm";
import { ccdRegistrations, ccdEvents, ccdPermissions } from "../../drizzle/schema";
import type { InsertCcdRegistration, InsertCcdEvent, CcdPermission } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== CCD REGISTRATION HELPERS =====

export async function createCcdRegistration(data: InsertCcdRegistration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ccdRegistrations).values(data);
  return result[0].insertId;
}

export async function getCcdRegistrations(schoolYear?: string) {
  const db = await getDb();
  if (!db) return [];
  if (schoolYear) {
    return db.select().from(ccdRegistrations)
      .where(eq(ccdRegistrations.schoolYear, schoolYear))
      .orderBy(desc(ccdRegistrations.createdAt));
  }
  return db.select().from(ccdRegistrations).orderBy(desc(ccdRegistrations.createdAt));
}

export async function updateCcdRegistrationStatus(id: number, status: "pending" | "approved" | "waitlisted" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ccdRegistrations).set({ status }).where(eq(ccdRegistrations.id, id));
}

// ===== CCD EVENTS =====

export async function getCcdEvents(schoolYear?: string) {
  const db = await getDb();
  if (!db) return [];
  if (schoolYear) {
    return db.select().from(ccdEvents).where(eq(ccdEvents.schoolYear, schoolYear)).orderBy(ccdEvents.eventDate);
  }
  return db.select().from(ccdEvents).orderBy(desc(ccdEvents.eventDate));
}

export async function createCcdEvent(data: Omit<InsertCcdEvent, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ccdEvents).values(data);
  return result[0].insertId;
}

export async function updateCcdEvent(id: number, data: Partial<InsertCcdEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ccdEvents).set(data).where(eq(ccdEvents.id, id));
}

export async function deleteCcdEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(ccdEvents).where(eq(ccdEvents.id, id));
}

// ===== CCD PERMISSIONS =====

export async function createCcdPermission(data: Omit<CcdPermission, "id" | "createdAt" | "updatedAt" | "status" | "adminNotes">) {
  const db = await getDb();
  const result = await db!.insert(ccdPermissions).values(data as any);
  return result[0].insertId;
}

export async function getCcdPermissions(schoolYear?: string) {
  const db = await getDb();
  if (schoolYear) {
    return db!.select().from(ccdPermissions).where(eq(ccdPermissions.schoolYear, schoolYear)).orderBy(desc(ccdPermissions.createdAt));
  }
  return db!.select().from(ccdPermissions).orderBy(desc(ccdPermissions.createdAt));
}

export async function updateCcdPermissionStatus(id: number, status: "pending" | "approved" | "flagged", adminNotes?: string) {
  const db = await getDb();
  await db!.update(ccdPermissions).set({ status, adminNotes: adminNotes || undefined }).where(eq(ccdPermissions.id, id));
}

// ===== CCD REMINDERS =====

export async function getCcdReminderParents() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: ccdRegistrations.id,
    parentFirstName: ccdRegistrations.parentFirstName,
    parentEmail: ccdRegistrations.parentEmail,
    childFirstName: ccdRegistrations.childFirstName,
    grade: ccdRegistrations.grade,
    unsubscribeToken: ccdRegistrations.unsubscribeToken,
  }).from(ccdRegistrations)
    .where(and(
      eq(ccdRegistrations.reminderOptIn, true),
      eq(ccdRegistrations.status, "approved"),
    ));
}

export async function getUpcomingCcdEvents(daysAhead: number = 2) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return db.select().from(ccdEvents)
    .where(and(
      gte(ccdEvents.eventDate, now),
      lte(ccdEvents.eventDate, future),
    ))
    .orderBy(ccdEvents.eventDate);
}

export async function unsubscribeCcdReminder(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ccdRegistrations)
    .set({ reminderOptIn: false })
    .where(eq(ccdRegistrations.unsubscribeToken, token));
}
