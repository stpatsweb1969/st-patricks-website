/**
 * Bulletins Router — CRUD for weekly parish bulletins (PDF uploads).
 */
import { publicProcedure, router, z, db, nanoid, storagePut, TRPCError, sectionProcedure } from "./_helpers";

const bulletinsSection = sectionProcedure("bulletins");
import { validateBase64File } from "../middleware";
import { sendBulletinNotifications } from "../notifications";
import { createAuditLog } from "../db/auditLog";

export const bulletinsRouter = router({
  listPublished: publicProcedure.query(async () => {
    return db.getPublishedBulletins();
  }),
  listAll: bulletinsSection.query(async () => {
    return db.getAllBulletins();
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return db.getBulletinById(input.id);
  }),
  create: bulletinsSection.input(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    pdfUrl: z.string().min(1),
    pdfKey: z.string().min(1),
    weekDate: z.string(),
    published: z.boolean().default(false),
  })).mutation(async ({ input, ctx }) => {
    const publishedAt = input.published ? new Date() : undefined;
    const id = await db.createBulletin({
      ...input,
      description: input.description ?? null,
      weekDate: new Date(input.weekDate),
      publishedAt: publishedAt ?? null,
      authorId: ctx.user.id,
    });
    if (input.published) {
      sendBulletinNotifications(id, input.title);
    }
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.published ? "publish" : "create", entityType: "bulletin", entityId: String(id), details: JSON.stringify({ title: input.title }) });
    return { id };
  }),
  update: bulletinsSection.input(z.object({
    id: z.number(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    weekDate: z.string().optional(),
    published: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    const existing = await db.getBulletinById(id);
    if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

    const updateData: Record<string, unknown> = { ...data };
    if (data.weekDate) updateData.weekDate = new Date(data.weekDate);

    if (data.published && !existing.published) {
      updateData.publishedAt = new Date();
      await db.updateBulletin(id, updateData as any);
      sendBulletinNotifications(id, data.title || existing.title);
      createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "publish", entityType: "bulletin", entityId: String(id), details: JSON.stringify({ title: data.title || existing.title }) });
    } else {
      await db.updateBulletin(id, updateData as any);
      if (data.published === false && existing.published) {
        createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "unpublish", entityType: "bulletin", entityId: String(id), details: JSON.stringify({ title: existing.title }) });
      }
    }
    return { success: true };
  }),
  delete: bulletinsSection.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const existing = await db.getBulletinById(input.id);
    await db.deleteBulletin(input.id);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "delete", entityType: "bulletin", entityId: String(input.id), details: JSON.stringify({ title: existing?.title }) });
    return { success: true };
  }),
  listDeleted: bulletinsSection.query(async () => {
    return db.getDeletedBulletins();
  }),
  restore: bulletinsSection.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.restoreBulletin(input.id);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "restore", entityType: "bulletin", entityId: String(input.id), details: "{}" });
    return { success: true };
  }),
  uploadPdf: bulletinsSection.input(z.object({
    fileName: z.string(),
    fileBase64: z.string(),
    contentType: z.string().default("application/pdf"),
  })).mutation(async ({ input }) => {
    const validation = validateBase64File(input.fileBase64, input.contentType);
    if (!validation.valid) {
      throw new TRPCError({ code: "BAD_REQUEST", message: validation.error || "Invalid file" });
    }
    const buffer = validation.buffer!;
    const key = `bulletins/${nanoid()}-${input.fileName}`;
    const { url } = await storagePut(key, buffer, validation.detectedMimeType || input.contentType);
    return { url, key };
  }),
});
