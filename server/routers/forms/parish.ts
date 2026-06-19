/**
 * Parish-related form routers: documents, teen life, parish registration, CCD permissions.
 */
import { publicProcedure, router, z, db, nanoid, storagePut, sectionProcedure } from "../_helpers";
import { routeNotification } from "../../notifications/route";
const docsSection = sectionProcedure("documents");
const teenSection = sectionProcedure("teen_life");
const regSection = sectionProcedure("registrations");
const ccdPermSection = sectionProcedure("ccd_permissions");
import { rateLimitedFormProcedure } from "../_rateLimited";
import { validateBase64File } from "../../middleware";
import { createAuditLog } from "../../db/auditLog";

export const documentsRouter = router({
  byCategory: publicProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
    return db.getDocumentsByCategory(input.category);
  }),
  all: docsSection.query(async () => {
    return db.getAllDocuments();
  }),
  create: docsSection.input(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.string().min(1),
    fileUrl: z.string().min(1),
    fileKey: z.string().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    await db.createDocument({ ...input, sortOrder: input.sortOrder ?? 0 });
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "create", entityType: "document", details: JSON.stringify({ title: input.title, category: input.category }) });
    return { success: true };
  }),
  update: docsSection.input(z.object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    fileUrl: z.string().optional(),
    sortOrder: z.number().optional(),
    published: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    await db.updateDocument(id, data);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "update", entityType: "document", entityId: String(id), details: JSON.stringify({ title: data.title }) });
    return { success: true };
  }),
  delete: docsSection.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await db.deleteDocument(input.id);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: "delete", entityType: "document", entityId: String(input.id) });
    return { success: true };
  }),
  upload: docsSection.input(z.object({
    fileName: z.string(),
    fileData: z.string(),
    contentType: z.string(),
  })).mutation(async ({ input }) => {
    const validation = validateBase64File(input.fileData, input.contentType);
    if (!validation.valid) {
      throw new (await import("@trpc/server")).TRPCError({
        code: "BAD_REQUEST",
        message: validation.error || "Invalid file",
      });
    }
    const buffer = validation.buffer!;
    const key = `documents/${nanoid()}-${input.fileName}`;
    const { url } = await storagePut(key, buffer, validation.detectedMimeType || input.contentType);
    return { url, key };
  }),
});

export const teenLifeRouter = router({
  register: rateLimitedFormProcedure.input(z.object({
    teenFirstName: z.string().min(1),
    teenLastName: z.string().min(1),
    grade: z.string().min(1),
    school: z.string().optional(),
    parentName: z.string().min(1),
    parentEmail: z.string().email(),
    parentPhone: z.string().min(1),
    address: z.string().optional(),
    interests: z.string().optional(),
    medicalNotes: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    photoConsent: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    await db.createTeenLifeRegistration({
      ...input,
      photoConsent: input.photoConsent ? 1 : 0,
    });
    routeNotification("teen_life", {
      title: "New Teen Life Registration",
      content: `${input.teenFirstName} ${input.teenLastName} (Grade ${input.grade}) has registered for Teen Life. Parent: ${input.parentName} (${input.parentEmail}).`,
    });
    return { success: true };
  }),
  list: teenSection.query(async () => {
    return db.getTeenLifeRegistrations();
  }),
  updateStatus: teenSection.input(z.object({
    id: z.number(),
    status: z.string(),
    adminNotes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    await db.updateTeenLifeRegistrationStatus(input.id, input.status, input.adminNotes);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "teen_life_registration", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status }) });
    return { success: true };
  }),
});

export const parishRegistrationRouter = router({
  create: rateLimitedFormProcedure.input(z.object({
    headOfHousehold: z.string().min(1),
    spouseName: z.string().optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().default("NY"),
    zip: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    previousParish: z.string().optional(),
    numChildren: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    await db.createParishRegistration(input);
    routeNotification("registrations", {
      title: "New Parish Registration",
      content: `${input.headOfHousehold} (${input.email}) has registered as a new parishioner. Address: ${input.address}, ${input.city}, ${input.state} ${input.zip}. Phone: ${input.phone}.`,
    });
    return { success: true };
  }),
  list: regSection.query(async () => {
    return db.getParishRegistrations();
  }),
  updateStatus: regSection.input(z.object({
    id: z.number(),
    status: z.string(),
    adminNotes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    await db.updateParishRegistrationStatus(input.id, input.status, input.adminNotes);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "parish_registration", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status }) });
    return { success: true };
  }),
});

export const ccdPermissionsRouter = router({
  submit: rateLimitedFormProcedure.input(z.object({
    childFirstName: z.string().min(1),
    childLastName: z.string().min(1),
    childGrade: z.string().min(1),
    parentName: z.string().min(1),
    parentPhone: z.string().min(1),
    parentEmail: z.string().email(),
    needsBusTransport: z.boolean(),
    busPickupLocation: z.string().optional(),
    busDropoffLocation: z.string().optional(),
    busNotes: z.string().optional(),
    earlyDismissalAuthorized: z.boolean(),
    earlyDismissalReason: z.string().optional(),
    earlyDismissalDates: z.string().optional(),
    authorizedPickup1Name: z.string().min(1),
    authorizedPickup1Phone: z.string().min(1),
    authorizedPickup1Relation: z.string().min(1),
    authorizedPickup2Name: z.string().optional(),
    authorizedPickup2Phone: z.string().optional(),
    authorizedPickup2Relation: z.string().optional(),
    authorizedPickup3Name: z.string().optional(),
    authorizedPickup3Phone: z.string().optional(),
    authorizedPickup3Relation: z.string().optional(),
    allergies: z.string().optional(),
    medications: z.string().optional(),
    medicalConditions: z.string().optional(),
    doctorName: z.string().optional(),
    doctorPhone: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
    emergencyContactName: z.string().min(1),
    emergencyContactPhone: z.string().min(1),
    emergencyContactRelation: z.string().min(1),
    photoReleaseConsent: z.boolean(),
    medicalReleaseConsent: z.boolean(),
    parentSignature: z.string().min(1),
    signatureDate: z.string().min(1),
    schoolYear: z.string().min(1),
  })).mutation(async ({ input }) => {
    await db.createCcdPermission(input as any);
    routeNotification("ccd_permissions", {
      title: "New CCD Permission Form Submitted",
      content: `${input.parentName} submitted a CCD Permission & Release form for ${input.childFirstName} ${input.childLastName} (Grade ${input.childGrade}). Bus: ${input.needsBusTransport ? "Yes" : "No"}, Photo Release: ${input.photoReleaseConsent ? "Yes" : "No"}.`,
    });
    return { success: true };
  }),
  list: ccdPermSection.query(async () => {
    return db.getCcdPermissions();
  }),
  updateStatus: ccdPermSection.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "approved", "flagged"]),
    adminNotes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    await db.updateCcdPermissionStatus(input.id, input.status, input.adminNotes);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "ccd_permission", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status }) });
    return { success: true };
  }),
});
