/**
 * Sacrament status-update emails — per-type/stage warm copy.
 * Called from updateStatus mutations when admin checks "Notify the family".
 */
import { sendEmail } from "./index";
import type { SacramentType } from "../../shared/sacramentStages";

function wrapInBrandedTemplate(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<tr><td style="background:#1a5c2e;padding:20px 24px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">St. Patrick in Armonk</h1>
</td></tr>
<tr><td style="padding:28px 24px;">
${content}
</td></tr>
<tr><td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #eee;text-align:center;">
<p style="margin:0;font-size:12px;color:#888;">St. Patrick Church · 29 Cox Avenue, Armonk, NY 10504 · (914) 273-9724</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Per-type/stage copy ─────────────────────────────────────────────────────

interface StatusCopy {
  subject: string;
  heading: string;
  body: string;
  preheader: string;
}

function getBaptismCopy(newStatus: string, name: string): StatusCopy {
  switch (newStatus) {
    case "approved":
      return {
        subject: "Baptism Registration Approved — St. Patrick in Armonk",
        heading: "Your Baptism Registration Is Approved",
        body: `<p style="margin:0 0 12px;color:#333;">Great news! Your Baptism registration for <strong>${name}</strong> has been approved. The parish office will reach out shortly to schedule the preparation class and ceremony date.</p>
<p style="margin:0 0 12px;color:#555;">If you have any questions, please call the parish office at (914) 273-9724.</p>`,
        preheader: `Baptism registration for ${name} has been approved`,
      };
    case "scheduled":
      return {
        subject: "Baptism Scheduled — St. Patrick in Armonk",
        heading: "Your Baptism Has Been Scheduled",
        body: `<p style="margin:0 0 12px;color:#333;">The Baptism for <strong>${name}</strong> has been scheduled. Please check with the parish office for the confirmed date and time.</p>`,
        preheader: `Baptism for ${name} has been scheduled`,
      };
    case "denied":
      return {
        subject: "Baptism Registration Update — St. Patrick in Armonk",
        heading: "Regarding Your Baptism Registration",
        body: `<p style="margin:0 0 12px;color:#333;">We were unable to process the Baptism registration for <strong>${name}</strong> at this time. Please contact the parish office at (914) 273-9724 so we can discuss next steps and assist you.</p>`,
        preheader: `Update on Baptism registration for ${name}`,
      };
    default:
      return {
        subject: "Baptism Registration Update — St. Patrick in Armonk",
        heading: "Baptism Registration Update",
        body: `<p style="margin:0 0 12px;color:#333;">There has been an update to the Baptism registration for <strong>${name}</strong>. If you have any questions, please contact the parish office at (914) 273-9724.</p>`,
        preheader: `Update on Baptism registration for ${name}`,
      };
  }
}

function getSponsorCopy(newStatus: string, name: string): StatusCopy {
  switch (newStatus) {
    case "approved":
      return {
        subject: "Sponsor Certificate Approved — St. Patrick in Armonk",
        heading: "Your Sponsor Certificate Is Ready",
        body: `<p style="margin:0 0 12px;color:#333;">Your sponsor certificate request has been approved. You may pick up the certificate at the parish office during regular hours, or contact us to arrange delivery.</p>`,
        preheader: `Sponsor certificate for ${name} has been approved`,
      };
    case "denied":
      return {
        subject: "Sponsor Certificate Update — St. Patrick in Armonk",
        heading: "Regarding Your Sponsor Certificate Request",
        body: `<p style="margin:0 0 12px;color:#333;">We were unable to issue a sponsor certificate at this time. This is often due to eligibility requirements. Please contact the parish office at (914) 273-9724 to discuss your situation — we're happy to help.</p>`,
        preheader: `Update on sponsor certificate request for ${name}`,
      };
    default:
      return {
        subject: "Sponsor Certificate Update — St. Patrick in Armonk",
        heading: "Sponsor Certificate Update",
        body: `<p style="margin:0 0 12px;color:#333;">There has been an update to your sponsor certificate request. If you have any questions, please contact the parish office at (914) 273-9724.</p>`,
        preheader: `Update on sponsor certificate request for ${name}`,
      };
  }
}

function getMarriageCopy(newStatus: string, name: string): StatusCopy {
  switch (newStatus) {
    case "meeting_scheduled":
      return {
        subject: "Marriage Preparation Meeting Scheduled — St. Patrick in Armonk",
        heading: "Your Meeting Has Been Scheduled",
        body: `<p style="margin:0 0 12px;color:#333;">A meeting has been scheduled to begin your marriage preparation. The parish office will confirm the date and time. Please bring any required documents discussed during your initial contact.</p>`,
        preheader: `Marriage preparation meeting scheduled for ${name}`,
      };
    case "scheduled":
      return {
        subject: "Wedding Date Confirmed — St. Patrick in Armonk",
        heading: "Your Wedding Date Is Confirmed",
        body: `<p style="margin:0 0 12px;color:#333;">Wonderful news! Your wedding date has been confirmed. The parish office will be in touch with details about rehearsal and final preparations.</p>`,
        preheader: `Wedding date confirmed for ${name}`,
      };
    case "denied":
    case "declined":
      return {
        subject: "Marriage Inquiry Update — St. Patrick in Armonk",
        heading: "Regarding Your Marriage Inquiry",
        body: `<p style="margin:0 0 12px;color:#333;">We were unable to proceed with your marriage inquiry at this time. This may be due to scheduling or canonical requirements. Please contact the parish office at (914) 273-9724 — we want to help you find a path forward.</p>`,
        preheader: `Update on marriage inquiry for ${name}`,
      };
    default:
      return {
        subject: "Marriage Inquiry Update — St. Patrick in Armonk",
        heading: "Marriage Inquiry Update",
        body: `<p style="margin:0 0 12px;color:#333;">There has been an update to your marriage inquiry. If you have any questions, please contact the parish office at (914) 273-9724.</p>`,
        preheader: `Update on marriage inquiry for ${name}`,
      };
  }
}

function getFuneralCopy(newStatus: string, name: string): StatusCopy {
  switch (newStatus) {
    case "scheduled":
      return {
        subject: "Funeral Service Scheduled — St. Patrick in Armonk",
        heading: "Funeral Service Has Been Scheduled",
        body: `<p style="margin:0 0 12px;color:#333;">The funeral service for <strong>${name}</strong> has been scheduled. The parish office will confirm all details with you directly. Please don't hesitate to reach out if you need anything during this time.</p>`,
        preheader: `Funeral service for ${name} has been scheduled`,
      };
    case "denied":
    case "declined":
      return {
        subject: "Funeral Planning Update — St. Patrick in Armonk",
        heading: "Regarding Funeral Planning",
        body: `<p style="margin:0 0 12px;color:#333;">We need to discuss the funeral arrangements for <strong>${name}</strong> further. Please contact the parish office at (914) 273-9724 at your earliest convenience so we can assist you.</p>`,
        preheader: `Update on funeral planning for ${name}`,
      };
    default:
      return {
        subject: "Funeral Planning Update — St. Patrick in Armonk",
        heading: "Funeral Planning Update",
        body: `<p style="margin:0 0 12px;color:#333;">There has been an update regarding the funeral arrangements for <strong>${name}</strong>. If you have any questions, please contact the parish office at (914) 273-9724.</p>`,
        preheader: `Update on funeral planning for ${name}`,
      };
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Which statuses default "Notify the family" to ON (family-facing milestones).
 * Internal transitions (contacted, completed) default OFF.
 */
export const NOTIFY_DEFAULT_ON: string[] = [
  "approved",
  "scheduled",
  "meeting_scheduled",
  "denied",
  "declined",
];

export const NOTIFY_DEFAULT_OFF: string[] = [
  "contacted",
  "completed",
];

/**
 * Send a sacrament status-update email to the submitter.
 * Returns true on success, false on failure (never throws).
 */
export async function sendSacramentStatusEmail(params: {
  type: SacramentType;
  newStatus: string;
  recipientEmail: string;
  recipientName: string;
  subjectName: string; // child/candidate/couple/deceased name
}): Promise<boolean> {
  const { type, newStatus, recipientEmail, subjectName } = params;

  let copy: StatusCopy;
  switch (type) {
    case "baptism":
      copy = getBaptismCopy(newStatus, subjectName);
      break;
    case "sponsor":
      copy = getSponsorCopy(newStatus, subjectName);
      break;
    case "marriage":
      copy = getMarriageCopy(newStatus, subjectName);
      break;
    case "funeral":
      copy = getFuneralCopy(newStatus, subjectName);
      break;
    default:
      return false;
  }

  const html = wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">${copy.heading}</h2>
    <p style="margin:0 0 12px;color:#333;">Dear ${params.recipientName},</p>
    ${copy.body}
    <p style="margin:0;">God bless,<br><em>St. Patrick Parish Office</em></p>
  `, copy.preheader);

  try {
    return await sendEmail(recipientEmail, copy.subject, html);
  } catch (err) {
    console.warn(`[SacramentStatusEmail] Failed to send to ${recipientEmail}:`, err);
    return false;
  }
}
