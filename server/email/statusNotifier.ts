/**
 * Status Change Notifier — sends automated follow-up emails when
 * form submission statuses change (approved, rejected, needs-info, etc.)
 */
import { sendEmail, buildStatusUpdateEmail } from "./index";

interface StatusChangeParams {
  formType: string;
  submitterName: string;
  submitterEmail: string;
  newStatus: string;
  adminNotes?: string;
}

/**
 * Send a status update email to the submitter.
 * Call this from admin updateStatus mutations after the DB update succeeds.
 * Fires and forgets — does not block the mutation response.
 */
export function notifyStatusChange({
  formType,
  submitterName,
  submitterEmail,
  newStatus,
  adminNotes,
}: StatusChangeParams): void {
  // Only send for meaningful status transitions
  const notifiableStatuses = ["approved", "rejected", "needs_info", "scheduled", "completed"];
  if (!notifiableStatuses.includes(newStatus)) return;

  const html = buildStatusUpdateEmail(formType, submitterName, newStatus);
  const subject = `${formType} — ${newStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;

  // Fire and forget — don't block the admin action
  sendEmail(submitterEmail, subject, html).catch((err) => {
    console.warn(`[StatusNotifier] Failed to send email to ${submitterEmail}:`, err);
  });
}
