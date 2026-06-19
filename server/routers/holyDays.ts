/**
 * Holy Days Router — public upcoming list + admin CRUD for holy day mass times.
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure } from "./_helpers";
import { router } from "../_core/trpc";
import * as db from "../db";

const holyDayInput = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  massTimes: z.array(z.string().min(1)).min(1),
  category: z.enum(["holy_day", "special_mass", "seasonal", "parish_feast", "triduum", "other"]).default("holy_day"),
  notes: z.string().nullable().optional(),
});

export const holyDaysRouter = router({
  /** Public: get upcoming holy days (date >= today) */
  upcoming: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ input }) => {
      return db.getUpcomingHolyDays(input?.limit ?? 10);
    }),

  /** Admin: get all holy days (past + future) */
  listAll: protectedProcedure.query(async () => {
    return db.getAllHolyDays();
  }),

  /** Admin: create or update a holy day */
  upsert: protectedProcedure
    .input(holyDayInput)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.upsertHolyDay({ ...data, id });
    }),

  /** Admin: delete a holy day */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteHolyDay(input.id);
      return { success: true };
    }),
});
