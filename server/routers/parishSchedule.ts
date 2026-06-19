/**
 * Parish Schedule Router — Admin-editable single source of truth for all Mass/service times.
 * Stores schedule as JSON in site_settings table.
 */
import { z } from "zod";
import { router } from "../routers/_helpers";
import { publicProcedure, adminProcedure } from "../routers/_helpers";
import * as db from "../db";
import { createAuditLog } from "../db/auditLog";
import { DEFAULT_PARISH_SCHEDULE, DEFAULT_PARISH_INFO } from "../../shared/scheduleEngine";
import type { ParishSchedule, ParishInfo } from "../../shared/scheduleEngine";

const SCHEDULE_KEY = "parish_schedule";
const INFO_KEY = "parish_info";

async function getSchedule(): Promise<ParishSchedule> {
  const raw = await db.getSiteSetting(SCHEDULE_KEY);
  if (!raw) return DEFAULT_PARISH_SCHEDULE;
  try {
    return JSON.parse(raw) as ParishSchedule;
  } catch {
    return DEFAULT_PARISH_SCHEDULE;
  }
}

async function getInfo(): Promise<ParishInfo> {
  const raw = await db.getSiteSetting(INFO_KEY);
  if (!raw) return DEFAULT_PARISH_INFO;
  try {
    return JSON.parse(raw) as ParishInfo;
  } catch {
    return DEFAULT_PARISH_INFO;
  }
}

export const parishScheduleRouter = router({
  /** Public: get the current schedule (used by all frontend consumers) */
  getSchedule: publicProcedure.query(async () => {
    return getSchedule();
  }),

  /** Public: get parish info (name, address, phone, etc.) */
  getInfo: publicProcedure.query(async () => {
    return getInfo();
  }),

  /** Admin: update the full schedule */
  updateSchedule: adminProcedure
    .input(z.object({ schedule: z.any() }))
    .mutation(async ({ input, ctx }) => {
      await db.upsertSiteSetting(SCHEDULE_KEY, JSON.stringify(input.schedule));
      await createAuditLog({
        userId: ctx.user.openId,
        userName: ctx.user.name || undefined,
        action: "update",
        entityType: "parish_schedule",
        details: "Schedule updated",
      });
      return { success: true };
    }),

  /** Admin: update parish info */
  updateInfo: adminProcedure
    .input(z.object({ info: z.any() }))
    .mutation(async ({ input, ctx }) => {
      await db.upsertSiteSetting(INFO_KEY, JSON.stringify(input.info));
      await createAuditLog({
        userId: ctx.user.openId,
        userName: ctx.user.name || undefined,
        action: "update",
        entityType: "parish_info",
        details: "Parish info updated",
      });
      return { success: true };
    }),
});
