/**
 * Volunteer Needs Board — urgent/time-sensitive volunteer requests.
 * Public: list active needs, respond to a need.
 * Admin: create, update, close needs.
 */
import { publicProcedure, router, z, db, sectionProcedure } from "./_helpers";
const volunteersSection = sectionProcedure("volunteers");
import { rateLimitedFormProcedure } from "./_rateLimited";
import { createAuditLog } from "../db/auditLog";

export const volunteerNeedsRouter = router({
  /** List active volunteer needs (public) */
  list: publicProcedure.query(async () => {
    return db.getActiveVolunteerNeeds();
  }),

  /** List all needs including inactive (admin) */
  listAll: volunteersSection.query(async () => {
    return db.getAllVolunteerNeeds();
  }),

  /** Get responses for a specific need (admin) */
  getResponses: volunteersSection
    .input(z.object({ needId: z.number() }))
    .query(async ({ input }) => {
      return db.getVolunteerNeedResponses(input.needId);
    }),

  /** Create a new volunteer need (admin) */
  create: volunteersSection
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      urgency: z.enum(["low", "medium", "high"]).default("medium"),
      category: z.string().optional(),
      neededBy: z.date().optional(),
      spotsNeeded: z.number().min(1).default(1),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createVolunteerNeed({
        title: input.title,
        description: input.description,
        urgency: input.urgency,
        category: input.category,
        neededBy: input.neededBy,
        spotsNeeded: input.spotsNeeded,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
      });
      createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "create", entityType: "volunteer_need", entityId: String(id), details: JSON.stringify({ title: input.title, urgency: input.urgency }) });
      return { id };
    }),

  /** Update a volunteer need (admin) */
  update: volunteersSection
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      urgency: z.enum(["low", "medium", "high"]).optional(),
      category: z.string().optional(),
      neededBy: z.date().nullable().optional(),
      spotsNeeded: z.number().min(1).optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      await db.updateVolunteerNeed(id, updates);
      createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.active === false ? "close" : "update", entityType: "volunteer_need", entityId: String(id), details: JSON.stringify({ title: input.title }) });
      return { success: true };
    }),

  /** Respond to a volunteer need (public, rate-limited) */
  respond: rateLimitedFormProcedure
    .input(z.object({
      needId: z.number(),
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createVolunteerNeedResponse({
        needId: input.needId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
      });
      return { success: true };
    }),
});
