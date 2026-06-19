/**
 * Sacrament-specific confirmation email builders.
 * Each mirrors the on-screen success copy shown to the submitter.
 */
import { sendEmail } from "./index";

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

// ─── Baptism ────────────────────────────────────────────────────────────────

export async function sendBaptismConfirmation(parentEmail: string, childName: string): Promise<boolean> {
  const html = wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">Baptism Registration Received</h2>
    <p style="margin:0 0 12px;color:#333;">Dear Parent/Guardian,</p>
    <p style="margin:0 0 12px;color:#333;">We have received your Baptism registration for <strong>${childName}</strong>. The parish office will contact you within <strong>3–5 business days</strong> to discuss preparation class dates and schedule the ceremony.</p>
    <p style="margin:0 0 12px;color:#555;"><strong>Please note:</strong> A Baptism preparation class is required before the ceremony. The office will provide available dates when they contact you.</p>
    <p style="margin:0 0 12px;color:#555;">If you have any questions in the meantime, please call the parish office at (914) 273-9724.</p>
    <p style="margin:0;">God bless,<br><em>St. Patrick Parish Office</em></p>
  `, "Your Baptism registration has been received");

  return sendEmail(
    parentEmail,
    "Baptism Registration Received — St. Patrick in Armonk",
    html
  );
}

// ─── Sponsor Certificate ────────────────────────────────────────────────────

export async function sendSponsorConfirmation(sponsorEmail: string, sponsorName: string, candidateName: string): Promise<boolean> {
  const html = wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">Sponsor Certificate Request Submitted</h2>
    <p style="margin:0 0 12px;color:#333;">Dear ${sponsorName},</p>
    <p style="margin:0 0 12px;color:#333;">Your sponsor certificate request for <strong>${candidateName}</strong> has been received. The parish office will review your eligibility and contact you if additional information is needed.</p>
    <p style="margin:0 0 12px;color:#555;">If you have any questions, please contact the parish office at (914) 273-9724.</p>
    <p style="margin:0;">God bless,<br><em>St. Patrick Parish Office</em></p>
  `, "Your sponsor certificate request has been received");

  return sendEmail(
    sponsorEmail,
    "Sponsor Certificate Request Received — St. Patrick in Armonk",
    html
  );
}

// ─── Marriage ───────────────────────────────────────────────────────────────

export async function sendMarriageConfirmation(brideEmail: string, brideName: string, groomName: string): Promise<boolean> {
  const html = wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">Marriage Inquiry Received</h2>
    <p style="margin:0 0 12px;color:#333;">Dear ${brideName} & ${groomName},</p>
    <p style="margin:0 0 12px;color:#333;">Congratulations on your engagement! The parish office has received your marriage inquiry and will contact you within <strong>one week</strong> to schedule an initial meeting with the priest.</p>
    <p style="margin:0 0 12px;color:#555;"><strong>Important:</strong> Couples should begin marriage preparation at least 6 months before the desired wedding date.</p>
    <p style="margin:0 0 12px;color:#555;">If you have any questions, please contact the parish office at (914) 273-9724.</p>
    <p style="margin:0;">God bless,<br><em>St. Patrick Parish Office</em></p>
  `, "Your marriage inquiry has been received");

  return sendEmail(
    brideEmail,
    "Marriage Inquiry Received — St. Patrick in Armonk",
    html
  );
}

// ─── Funeral ────────────────────────────────────────────────────────────────

export async function sendFuneralConfirmation(plannerEmail: string, plannerName: string, deceasedName: string, isPrePlanning: boolean): Promise<boolean> {
  const body = isPrePlanning
    ? `<p style="margin:0 0 12px;color:#333;">Dear ${plannerName},</p>
       <p style="margin:0 0 12px;color:#333;">Your funeral pre-planning form for <strong>${deceasedName}</strong> has been received and will be kept on file. You may update it at any time by contacting the parish office.</p>`
    : `<p style="margin:0 0 12px;color:#333;">Dear ${plannerName},</p>
       <p style="margin:0 0 12px;color:#333;">We are sorry for your loss. The parish office has received your funeral planning form for <strong>${deceasedName}</strong> and will contact you shortly to finalize arrangements.</p>`;

  const html = wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">Funeral Planning Form Received</h2>
    ${body}
    <p style="margin:0 0 12px;color:#555;">If you have any questions, please contact the parish office at (914) 273-9724.</p>
    <p style="margin:0;">God bless,<br><em>St. Patrick Parish Office</em></p>
  `, "Your funeral planning form has been received");

  return sendEmail(
    plannerEmail,
    "Funeral Planning Form Received — St. Patrick in Armonk",
    html
  );
}
