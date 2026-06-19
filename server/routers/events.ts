/**
 * Events Router — CRUD for parish events.
 */
import { publicProcedure, router, z, db, sectionProcedure } from "./_helpers";

const eventsSection = sectionProcedure("events");
import { createAuditLog } from "../db/auditLog";

export const eventsRouter = router({
  listUpcoming: publicProcedure.query(async () => {
    return db.getUpcomingEvents();
  }),
  listAll: eventsSection.query(async () => {
    return db.getAllEvents();
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return db.getEventById(input.id);
  }),
  create: eventsSection.input(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    allDay: z.boolean().default(false),
    published: z.boolean().default(true),
  })).mutation(async ({ input, ctx }) => {
    const id = await db.createEvent({
      ...input,
      description: input.description ?? null,
      location: input.location ?? null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      authorId: ctx.user.id,
    });
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "create", entityType: "event", entityId: String(id), details: JSON.stringify({ title: input.title }) });
    return { id };
  }),
  update: eventsSection.input(z.object({
    id: z.number(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    allDay: z.boolean().optional(),
    published: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    await db.updateEvent(id, updateData as any);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "update", entityType: "event", entityId: String(id), details: JSON.stringify({ title: data.title }) });
    return { success: true };
  }),
  delete: eventsSection.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const existing = await db.getEventById(input.id);
    await db.deleteEvent(input.id);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "delete", entityType: "event", entityId: String(input.id), details: JSON.stringify({ title: existing?.title }) });
    return { success: true };
  }),
});
