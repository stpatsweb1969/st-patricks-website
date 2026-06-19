/**
 * Sacrament-related form routers: baptism, sponsor, marriage, funeral.
 */
import { router, z, db, sectionProcedure } from "../_helpers";
import { routeNotification } from "../../notifications/route";
const sacSection = sectionProcedure("sacraments");
import { rateLimitedFormProcedure } from "../_rateLimited";
import { createAuditLog } from "../../db/auditLog";
import {
  sendBaptismConfirmation,
  sendSponsorConfirmation,
  sendMarriageConfirmation,
  sendFuneralConfirmation,
} from "../../email/sacramentConfirmations";
import { sendSacramentStatusEmail } from "../../email/sacramentStatusEmails";

export const baptismRouter = router({
  submit: rateLimitedFormProcedure.input(z.object({
    childFirstName: z.string().min(1),
    childLastName: z.string().min(1),
    childDob: z.string().min(1),
    childGender: z.string().min(1),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    parentEmail: z.string().email(),
    parentPhone: z.string().min(1),
    address: z.string().min(1),
    godparentName1: z.string().optional(),
    godparentName2: z.string().optional(),
    preferredDate: z.string().optional(),
    birthCertUrl: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    await db.createBaptismRegistration(input as any);
    await routeNotification("sacraments", { title: "New Baptism Registration", content: `${input.childFirstName} ${input.childLastName} - Parent: ${input.parentEmail}` });
    // Send confirmation email to parent
    await sendBaptismConfirmation(input.parentEmail, `${input.childFirstName} ${input.childLastName}`);
    return { success: true };
  }),
  list: sacSection.query(async () => {
    return db.getBaptismRegistrations();
  }),
  updateStatus: sacSection.input(z.object({
    id: z.number(),
    status: z.string(),
    adminNotes: z.string().optional(),
    notify: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    await db.updateBaptismStatus(input.id, input.status, input.adminNotes);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "baptism_registration", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status }) });
    if (input.notify) {
      const contact = await db.getBaptismContactInfo(input.id);
      if (contact?.email) {
        sendSacramentStatusEmail({ type: "baptism", newStatus: input.status, recipientEmail: contact.email, recipientName: contact.recipientName, subjectName: contact.name }).catch(() => {});
      }
    }
    return { success: true };
  }),
});

export const sponsorRouter = router({
  submit: rateLimitedFormProcedure.input(z.object({
    sponsorFirstName: z.string().min(1),
    sponsorLastName: z.string().min(1),
    sponsorEmail: z.string().email(),
    sponsorPhone: z.string().min(1),
    sponsorAddress: z.string().min(1),
    sponsorParish: z.string().min(1),
    sponsorParishCity: z.string().min(1),
    sacramentType: z.enum(["baptism", "confirmation"]),
    candidateName: z.string().min(1),
    ceremonyDate: z.string().optional(),
    isBaptized: z.boolean(),
    isConfirmed: z.boolean(),
    isActiveCatholic: z.boolean(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    await db.createSponsorCertificate(input as any);
    await routeNotification("sacraments", { title: "New Sponsor Certificate Request", content: `${input.sponsorFirstName} ${input.sponsorLastName} for ${input.candidateName} (${input.sacramentType})` });
    // Send confirmation email to sponsor
    await sendSponsorConfirmation(input.sponsorEmail, `${input.sponsorFirstName} ${input.sponsorLastName}`, input.candidateName);
    return { success: true };
  }),
  list: sacSection.query(async () => {
    return db.getSponsorCertificates();
  }),
  updateStatus: sacSection.input(z.object({
    id: z.number(),
    status: z.string(),
    adminNotes: z.string().optional(),
    notify: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    await db.updateSponsorStatus(input.id, input.status, input.adminNotes);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "sponsor_certificate", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status }) });
    if (input.notify) {
      const contact = await db.getSponsorContactInfo(input.id);
      if (contact?.email) {
        sendSacramentStatusEmail({ type: "sponsor", newStatus: input.status, recipientEmail: contact.email, recipientName: contact.recipientName, subjectName: contact.name }).catch(() => {});
      }
    }
    return { success: true };
  }),
});

export const marriageRouter = router({
  submit: rateLimitedFormProcedure.input(z.object({
    brideFirstName: z.string().min(1),
    brideLastName: z.string().min(1),
    brideEmail: z.string().email(),
    bridePhone: z.string().min(1),
    brideReligion: z.string().optional(),
    brideParish: z.string().optional(),
    groomFirstName: z.string().min(1),
    groomLastName: z.string().min(1),
    groomEmail: z.string().optional(),
    groomPhone: z.string().optional(),
    groomReligion: z.string().optional(),
    groomParish: z.string().optional(),
    preferredDate: z.string().optional(),
    alternateDate: z.string().optional(),
    isParishioner: z.boolean(),
    previousMarriage: z.boolean(),
    previousMarriageDetails: z.string().optional(),
    guestCount: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    await db.createMarriageInquiry(input as any);
    await routeNotification("sacraments", { title: "New Marriage Inquiry", content: `${input.brideFirstName} ${input.brideLastName} & ${input.groomFirstName} ${input.groomLastName} - Preferred: ${input.preferredDate || 'TBD'}` });
    // Send confirmation email to bride
    await sendMarriageConfirmation(input.brideEmail, `${input.brideFirstName} ${input.brideLastName}`, `${input.groomFirstName} ${input.groomLastName}`);
    return { success: true };
  }),
  list: sacSection.query(async () => {
    return db.getMarriageInquiries();
  }),
  updateStatus: sacSection.input(z.object({
    id: z.number(),
    status: z.string(),
    adminNotes: z.string().optional(),
    notify: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    await db.updateMarriageStatus(input.id, input.status, input.adminNotes);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "marriage_inquiry", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status }) });
    if (input.notify) {
      const contact = await db.getMarriageContactInfo(input.id);
      if (contact?.email) {
        sendSacramentStatusEmail({ type: "marriage", newStatus: input.status, recipientEmail: contact.email, recipientName: contact.recipientName, subjectName: contact.name }).catch(() => {});
      }
    }
    return { success: true };
  }),
});

/** Unified view: all sacrament submissions in one typed list */
export const sacramentUnifiedRouter = router({
  allSubmissions: sacSection.query(async () => {
    return db.getAllSacramentSubmissions();
  }),
});

export const funeralRouter = router({
  submit: rateLimitedFormProcedure.input(z.object({
    plannerName: z.string().min(1),
    plannerEmail: z.string().email(),
    plannerPhone: z.string().min(1),
    plannerRelation: z.string().optional(),
    deceasedName: z.string().min(1),
    isPrePlanning: z.boolean(),
    preferredDate: z.string().optional(),
    massType: z.enum(["funeral_mass", "memorial_mass", "vigil_service", "graveside"]),
    firstReading: z.string().optional(),
    secondReading: z.string().optional(),
    gospel: z.string().optional(),
    hymns: z.string().optional(),
    eulogist: z.string().optional(),
    pallbearers: z.string().optional(),
    specialRequests: z.string().optional(),
  })).mutation(async ({ input }) => {
    await db.createFuneralPrePlanning(input as any);
    await routeNotification("sacraments", { title: "New Funeral Pre-Planning Form", content: `Planner: ${input.plannerName} - For: ${input.deceasedName} (${input.isPrePlanning ? 'Pre-planning' : 'Immediate need'})` });
    // Send confirmation email to planner
    await sendFuneralConfirmation(input.plannerEmail, input.plannerName, input.deceasedName, input.isPrePlanning);
    return { success: true };
  }),
  list: sacSection.query(async () => {
    return db.getFuneralPrePlannings();
  }),
  updateStatus: sacSection.input(z.object({
    id: z.number(),
    status: z.string(),
    adminNotes: z.string().optional(),
    notify: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    await db.updateFuneralStatus(input.id, input.status, input.adminNotes);
    createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "funeral_preplanning", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status }) });
    if (input.notify) {
      const contact = await db.getFuneralContactInfo(input.id);
      if (contact?.email) {
        sendSacramentStatusEmail({ type: "funeral", newStatus: input.status, recipientEmail: contact.email, recipientName: contact.recipientName, subjectName: contact.name }).catch(() => {});
      }
    }
    return { success: true };
  }),
});
