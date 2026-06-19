/**
 * CCD (Religious Education) Router — registration, events, permissions.
 */
import { publicProcedure, router, z, db, nanoid, sectionProcedure } from "./_helpers";
import { routeNotification } from "../notifications/route";
const ccdRegSection = sectionProcedure("ccd_registrations");
const ccdCalSection = sectionProcedure("ccd_calendar");
import { rateLimitedFormProcedure } from "./_rateLimited";
import { createAuditLog } from "../db/auditLog";

export const ccdRouter = router({
  register: rateLimitedFormProcedure.input(z.object({
    parentFirstName: z.string().min(1),
    parentLastName: z.string().min(1),
    parentEmail: z.string().email(),
    parentPhone: z.string().min(1),
    address: z.string().min(1),
    childFirstName: z.string().min(1),
    childLastName: z.string().min(1),
    childDob: z.string(),
    grade: z.string().min(1),
    baptized: z.boolean(),
    baptismChurch: z.string().optional(),
    firstCommunion: z.boolean(),
    schoolYear: z.string().min(1),
    notes: z.string().optional(),
    reminderOptIn: z.boolean().default(true),
  })).mutation(async ({ input }) => {
    const unsubscribeToken = nanoid(32);
    const id = await db.createCcdRegistration({
      ...input,
      childDob: new Date(input.childDob),
      baptismChurch: input.baptismChurch ?? null,
      notes: input.notes ?? null,
      reminderOptIn: input.reminderOptIn,
      unsubscribeToken,
    });
    await routeNotification("ccd_registrations", {
      title: "New CCD Registration",
      content: `${input.childFirstName} ${input.childLastName} (Grade ${input.grade}) has been registered for CCD ${input.schoolYear} by ${input.parentFirstName} ${input.parentLastName} (${input.parentEmail}).`,
    });
    return { success: true, id };
  }),
  list: ccdRegSection.input(z.object({
    schoolYear: z.string().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getCcdRegistrations(input?.schoolYear);
  }),
  updateStatus: ccdRegSection.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "approved", "waitlisted", "cancelled"]),
  })).mutation(async ({ input, ctx }) => {
    await db.updateCcdRegistrationStatus(input.id, input.status);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "ccd_registration", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status }) });
    return { success: true };
  }),
  // CCD Calendar Events
  listEvents: publicProcedure.input(z.object({
    schoolYear: z.string().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getCcdEvents(input?.schoolYear);
  }),
  createEvent: ccdCalSection.input(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    eventDate: z.string(),
    endDate: z.string().optional(),
    eventType: z.enum(["class", "holiday", "special", "sacrament"]),
    grade: z.string().optional(),
    location: z.string().optional(),
    schoolYear: z.string().min(1),
  })).mutation(async ({ input, ctx }) => {
    const id = await db.createCcdEvent({
      ...input,
      eventDate: new Date(input.eventDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      description: input.description ?? null,
      grade: input.grade ?? null,
      location: input.location ?? null,
    });
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "create", entityType: "ccd_event", entityId: String(id), details: JSON.stringify({ title: input.title, type: input.eventType }) });
    return { success: true, id };
  }),
  updateEvent: ccdCalSection.input(z.object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    eventDate: z.string().optional(),
    endDate: z.string().optional(),
    eventType: z.enum(["class", "holiday", "special", "sacrament"]).optional(),
    grade: z.string().optional(),
    location: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, eventDate, endDate, ...rest } = input;
    const data: any = { ...rest };
    if (eventDate) data.eventDate = new Date(eventDate);
    if (endDate) data.endDate = new Date(endDate);
    await db.updateCcdEvent(id, data);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "update", entityType: "ccd_event", entityId: String(id), details: JSON.stringify({ title: input.title }) });
    return { success: true };
  }),
  deleteEvent: ccdCalSection.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteCcdEvent(input.id);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "delete", entityType: "ccd_event", entityId: String(input.id) });
    return { success: true };
  }),
});
