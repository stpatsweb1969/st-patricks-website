/**
 * Admin Router — dashboard stats, user management, site settings, important dates.
 * ~110 lines
 */
import { adminProcedure, staffProcedure, sectionProcedure, publicProcedure, router, z, db } from "./_helpers";
import { getRoutingConfig, saveRoutingConfig, type NotificationRouting } from "../notifications/route";

export const adminStatsRouter = router({
  overview: staffProcedure.query(async () => {
    return db.getAdminStats();
  }),
  recentActivity: staffProcedure.query(async () => {
    return db.getRecentFormSubmissions(12);
  }),
  getPendingSubmissions: staffProcedure.query(async () => {
    return db.getPendingSubmissions();
  }),
  bulkUpdateStatus: adminProcedure
    .input(z.object({
      items: z.array(z.object({ type: z.string(), id: z.number() })),
      status: z.enum(["approved", "rejected"]),
    }))
    .mutation(async ({ input }) => {
      const updated = await db.bulkUpdateStatus(input.items, input.status);
      return { updated };
    }),
  updateNote: adminProcedure
    .input(z.object({
      id: z.number(),
      type: z.string(),
      note: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.updateAdminNote(input.type, input.id, input.note);
      return { success: true };
    }),
});

export const usersRouter = router({
  list: adminProcedure.query(async () => {
    return db.getAllUsers();
  }),
  updateRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin", "communications", "religious_ed", "youth_ministry", "sacraments", "parish_life"]),
    }))
    .mutation(async ({ input }) => {
      await db.updateUserRole(input.userId, input.role);
      return { success: true };
    }),
});

export const siteSettingsRouter = router({
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return { value: await db.getSiteSetting(input.key) };
    }),
  getAll: staffProcedure.query(async () => {
    return db.getAllSiteSettings();
  }),
  update: sectionProcedure("settings")
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.upsertSiteSetting(input.key, input.value);
      // Audit log
      await db.createAuditLog({
        userId: ctx.user.openId,
        userName: ctx.user.name || undefined,
        action: "update",
        entityType: "site_setting",
        entityId: input.key,
        details: JSON.stringify({ value: input.value.substring(0, 200) }),
      });
      return { success: true };
    }),
  auditLog: staffProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional(), entityType: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return db.getAuditLogs({ limit: input?.limit, entityType: input?.entityType });
    }),
  getNotificationRouting: adminProcedure.query(async () => {
    return getRoutingConfig();
  }),
  updateNotificationRouting: adminProcedure
    .input(z.object({
      catchall: z.string().email(),
      bySection: z.record(z.string(), z.string().email()),
    }))
    .mutation(async ({ input, ctx }) => {
      await saveRoutingConfig(input as NotificationRouting);
      await db.createAuditLog({
        userId: ctx.user.openId,
        userName: ctx.user.name || undefined,
        action: "update",
        entityType: "notification_routing",
        entityId: "config",
        details: JSON.stringify(input),
      });
      return { success: true };
    }),
});

export const importantDatesRouter = router({
  upcoming: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional() }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 12;
      return db.getUpcomingImportantDates(limit);
    }),
  allPublished: publicProcedure.query(async () => {
    return db.getAllPublishedImportantDates();
  }),
  all: sectionProcedure("key_dates").query(async () => {
    return db.getAllImportantDates();
  }),
  create: sectionProcedure("key_dates")
    .input(z.object({
      title: z.string().min(1).max(500),
      eventDate: z.string(),
      location: z.string().max(300).optional(),
      note: z.string().optional(),
      category: z.enum(["ccd", "cyo", "sacrament", "parish", "teen_life", "social"]),
      published: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createImportantDate({
        title: input.title,
        eventDate: new Date(input.eventDate),
        location: input.location || null,
        note: input.note || null,
        category: input.category,
        published: input.published ?? true,
      });
      return { id };
    }),
  update: sectionProcedure("key_dates")
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(500).optional(),
      eventDate: z.string().optional(),
      location: z.string().max(300).optional().nullable(),
      note: z.string().optional().nullable(),
      category: z.enum(["ccd", "cyo", "sacrament", "parish", "teen_life", "social"]).optional(),
      published: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.eventDate !== undefined) updateData.eventDate = new Date(data.eventDate);
      if (data.location !== undefined) updateData.location = data.location;
      if (data.note !== undefined) updateData.note = data.note;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.published !== undefined) updateData.published = data.published;
      await db.updateImportantDate(id, updateData);
      return { success: true };
    }),
  delete: sectionProcedure("key_dates")
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteImportantDate(input.id);
      return { success: true };
    }),
});
