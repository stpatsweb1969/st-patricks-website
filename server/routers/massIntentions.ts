/**
 * Mass Intentions Router — public submission + admin queue management.
 */
import { adminProcedure, publicProcedure, z, db } from "./_helpers";
import { routeNotification } from "../notifications/route";
import { createAuditLog } from "../db/auditLog";
import { sendEmail, buildFormConfirmationEmail } from "../email";

export const massIntentionsRouter = {
  /** Public: submit a Mass intention request */
  submit: publicProcedure
    .input(z.object({
      requesterName: z.string().min(1).max(255),
      requesterEmail: z.string().email().max(255),
      requesterPhone: z.string().max(50).optional(),
      intentionFor: z.string().min(1).max(500),
      intentionType: z.enum(["living", "deceased", "thanksgiving", "special"]),
      preferredDate: z.string().max(50).optional(),
      preferredMass: z.string().max(100).optional(),
      notes: z.string().max(2000).optional(),
    }))
    .mutation(async ({ input }) => {
      await db.createMassIntention({
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        requesterPhone: input.requesterPhone || null,
        intentionFor: input.intentionFor,
        intentionType: input.intentionType,
        preferredDate: input.preferredDate || null,
        preferredMass: input.preferredMass || null,
        notes: input.notes || null,
      });

      // Notify parish office
      await routeNotification("sacraments", {
        title: "New Mass Intention Request",
        content: `${input.requesterName} has requested a Mass intention for ${input.intentionFor} (${input.intentionType}). Preferred date: ${input.preferredDate || "No preference"}.`,
      });

      // Send confirmation email to requester
      await sendEmail(
        input.requesterEmail,
        "Mass Intention Request Received — St. Patrick in Armonk",
        buildFormConfirmationEmail("Mass Intention", input.requesterName)
      );

      return { success: true };
    }),

  /** Admin: list all Mass intentions */
  list: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "scheduled", "completed", "cancelled", "all"]).optional().default("all"),
    }))
    .query(async ({ input }) => {
      return db.getMassIntentions(input.status);
    }),

  /** Admin: update status of a Mass intention */
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "scheduled", "completed", "cancelled"]),
      scheduledDate: z.string().optional(),
      scheduledMass: z.string().optional(),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.updateMassIntentionStatus(input.id, {
        status: input.status,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
        scheduledMass: input.scheduledMass || null,
        adminNotes: input.adminNotes || null,
      });
      createAuditLog({ userId: ctx.user.openId, userName: ctx.user.name || undefined, action: input.status, entityType: "mass_intention", entityId: String(input.id), details: JSON.stringify({ newStatus: input.status, scheduledDate: input.scheduledDate }) });
      return { success: true };
    }),
};
