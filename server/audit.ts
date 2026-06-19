/**
 * Audit Logger — records admin actions to the audit_logs table.
 * Call from any admin procedure after a significant action.
 */
import { getDb } from "./db/_connection";
import { auditLogs } from "../drizzle/schema";

interface AuditEntry {
  userId: string;
  userName?: string;
  action: string; // "approve", "reject", "delete", "create", "update", "publish"
  entityType: string; // "sacrament", "bulletin", "event", "volunteer_need", etc.
  entityId?: string | number;
  details?: Record<string, unknown>;
}

export async function logAuditEvent(entry: AuditEntry): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(auditLogs).values({
      userId: entry.userId,
      userName: entry.userName || null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId != null ? String(entry.entityId) : null,
      details: entry.details ? JSON.stringify(entry.details) : null,
    });
  } catch (error) {
    // Audit logging should never break the main flow
    console.warn("[Audit] Failed to log event:", error);
  }
}
