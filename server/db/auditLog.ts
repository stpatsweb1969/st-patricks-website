/**
 * Audit Log DB helpers — record admin actions for accountability.
 */
import { desc, eq, sql } from "drizzle-orm";
import { auditLogs } from "../../drizzle/schema";
import { getDb } from "./_connection";

export async function createAuditLog(entry: {
  userId: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values({
    userId: entry.userId,
    userName: entry.userName || null,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId || null,
    details: entry.details || null,
  });
}

export async function getAuditLogs(opts?: { limit?: number; entityType?: string }) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts?.limit ?? 50;
  if (opts?.entityType) {
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityType, opts.entityType))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
