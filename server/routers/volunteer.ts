/**
 * Volunteer Router — opportunities and signups.
 */
import { publicProcedure, router, z, db, sectionProcedure } from "./_helpers";
import { routeNotification } from "../notifications/route";
const volunteersSection = sectionProcedure("volunteers");
import { rateLimitedFormProcedure } from "./_rateLimited";
import { createAuditLog } from "../db/auditLog";

export const volunteerRouter = router({
  listOpportunities: publicProcedure.query(async () => {
    return db.getVolunteerOpportunities(true);
  }),
  listAllOpportunities: volunteersSection.query(async () => {
    return db.getVolunteerOpportunities(false);
  }),
  createOpportunity: volunteersSection.input(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    ministry: z.string().optional(),
    eventDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    spotsAvailable: z.number().min(1),
  })).mutation(async ({ input, ctx }) => {
    const id = await db.createVolunteerOpportunity({
      ...input,
      description: input.description ?? null,
      ministry: input.ministry ?? null,
      eventDate: input.eventDate ? new Date(input.eventDate) : null,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
    });
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "create", entityType: "volunteer_opportunity", entityId: String(id), details: JSON.stringify({ title: input.title }) });
    return { success: true, id };
  }),
  updateOpportunity: volunteersSection.input(z.object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    ministry: z.string().optional(),
    eventDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    spotsAvailable: z.number().optional(),
    active: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, eventDate, ...rest } = input;
    const data: any = { ...rest };
    if (eventDate) data.eventDate = new Date(eventDate);
    await db.updateVolunteerOpportunity(id, data);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "update", entityType: "volunteer_opportunity", entityId: String(id), details: JSON.stringify({ title: input.title }) });
    return { success: true };
  }),
  deleteOpportunity: volunteersSection.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteVolunteerOpportunity(input.id);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "delete", entityType: "volunteer_opportunity", entityId: String(input.id) });
    return { success: true };
  }),
  signup: rateLimitedFormProcedure.input(z.object({
    opportunityId: z.number(),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const id = await db.createVolunteerSignup({
      ...input,
      phone: input.phone ?? null,
      notes: input.notes ?? null,
    });
    routeNotification("volunteers", {
      title: "New Volunteer Signup",
      content: `${input.name} (${input.email}) signed up for opportunity #${input.opportunityId}.${input.notes ? ` Notes: ${input.notes}` : ""}`,
    });
    return { success: true, id };
  }),
  listSignups: volunteersSection.input(z.object({
    opportunityId: z.number(),
  })).query(async ({ input }) => {
    return db.getVolunteerSignups(input.opportunityId);
  }),
  cancelSignup: volunteersSection.input(z.object({
    id: z.number(),
    opportunityId: z.number(),
  })).mutation(async ({ input, ctx }) => {
    await db.cancelVolunteerSignup(input.id, input.opportunityId);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "cancel", entityType: "volunteer_signup", entityId: String(input.id) });
    return { success: true };
  }),
});
