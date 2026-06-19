/**
 * Staff Router — public list + admin CRUD for staff directory.
 */
import { publicProcedure, protectedProcedure, adminProcedure, router, z } from "./_helpers";
import { getDb } from "../db/_connection";
import { staffMembers } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

export const staffRouter = router({
  /** Public: list all staff grouped by category */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(staffMembers).orderBy(asc(staffMembers.category), asc(staffMembers.sortOrder));
  }),

  /** Admin: upsert a staff member */
  upsert: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      name: z.string().min(1).max(300),
      role: z.string().min(1).max(300),
      category: z.enum(["clergy", "staff", "leadership", "ministry_leader", "emeritus"]),
      phone: z.string().max(50).optional().nullable(),
      email: z.string().max(320).optional().nullable(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (input.id) {
        await db.update(staffMembers).set({
          name: input.name,
          role: input.role,
          category: input.category,
          phone: input.phone || null,
          email: input.email || null,
          sortOrder: input.sortOrder,
        }).where(eq(staffMembers.id, input.id));
        return { id: input.id };
      } else {
        const [result] = await db.insert(staffMembers).values({
          name: input.name,
          role: input.role,
          category: input.category,
          phone: input.phone || null,
          email: input.email || null,
          sortOrder: input.sortOrder,
        });
        return { id: result.insertId };
      }
    }),

  /** Admin: delete a staff member */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(staffMembers).where(eq(staffMembers.id, input.id));
      return { success: true };
    }),
});
