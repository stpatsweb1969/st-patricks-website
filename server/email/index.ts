/**
 * Centralized Email Service — single entry point for all email sending.
 * Provides branded templates and consistent error handling.
 */
import { ENV } from "../_core/env";

// ─── Core send function ──────────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Email] Forge API not configured, skipping email send");
    return false;
  }

  try {
    const normalizedBase = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
    const endpoint = new URL("webdevtoken.v1.WebDevService/SendEmailNotification", normalizedBase).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ to, subject, html: htmlBody }),
    });

    if (!response.ok) {
      console.warn(`[Email] Send failed for ${to}: ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[Email] Send error for ${to}:`, error);
    return false;
  }
}

// ─── Template wrapper ────────────────────────────────────────────────────────

function wrapInBrandedTemplate(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <!-- Header -->
  <tr><td style="background:#1a5c2e;padding:24px 32px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;font-family:Georgia,serif;">St. Patrick in Armonk</h1>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px;color:#333333;font-size:16px;line-height:1.7;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 32px;background:#f0ede8;text-align:center;font-size:12px;color:#888;">
    <p style="margin:0;">St. Patrick Church | 29 Cox Avenue, Armonk, NY 10504</p>
    <p style="margin:4px 0 0;">(914) 273-9724 | www.stpatsarmonk.org</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Pre-built templates ─────────────────────────────────────────────────────

export function buildNewsNotificationEmail(title: string, excerpt: string, link: string): string {
  return wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">${title}</h2>
    <p style="margin:0 0 20px;color:#555;">${excerpt}</p>
    <a href="${link}" style="display:inline-block;background:#1a5c2e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Read More</a>
  `, excerpt);
}

export function buildBulletinNotificationEmail(title: string, link: string): string {
  return wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">New Bulletin Published</h2>
    <p style="margin:0 0 20px;color:#555;">${title}</p>
    <a href="${link}" style="display:inline-block;background:#1a5c2e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Bulletin</a>
  `, `New bulletin: ${title}`);
}

export function buildFormConfirmationEmail(formType: string, submitterName: string): string {
  return wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">Submission Received</h2>
    <p style="margin:0 0 12px;">Dear ${submitterName},</p>
    <p style="margin:0 0 12px;">Thank you for submitting your <strong>${formType}</strong> form. We have received your submission and will review it shortly.</p>
    <p style="margin:0 0 12px;color:#555;">If you have any questions, please contact the parish office at (914) 273-9724.</p>
    <p style="margin:0;">God bless,<br><em>St. Patrick Parish Office</em></p>
  `, `Your ${formType} submission has been received`);
}

export function buildStatusUpdateEmail(formType: string, submitterName: string, newStatus: string): string {
  const statusColor = newStatus === "approved" ? "#1a5c2e" : newStatus === "rejected" ? "#dc2626" : "#d97706";
  return wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 12px;font-size:20px;">${formType} Update</h2>
    <p style="margin:0 0 12px;">Dear ${submitterName},</p>
    <p style="margin:0 0 12px;">Your <strong>${formType}</strong> submission status has been updated to: <span style="color:${statusColor};font-weight:700;text-transform:capitalize;">${newStatus}</span></p>
    <p style="margin:0 0 12px;color:#555;">If you have any questions, please contact the parish office.</p>
    <p style="margin:0;">God bless,<br><em>St. Patrick Parish Office</em></p>
  `, `Your ${formType} has been ${newStatus}`);
}

export function buildDigestEmail(items: Array<{ title: string; type: string; link: string }>): string {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eee;">
        <span style="display:inline-block;background:#e8f5e9;color:#1a5c2e;font-size:11px;padding:2px 8px;border-radius:4px;font-weight:600;text-transform:uppercase;">${item.type}</span>
        <a href="${item.link}" style="display:block;margin-top:4px;color:#333;text-decoration:none;font-weight:600;">${item.title}</a>
      </td>
    </tr>
  `).join("");

  return wrapInBrandedTemplate(`
    <h2 style="color:#1a5c2e;margin:0 0 16px;font-size:20px;">Your Weekly Parish Update</h2>
    <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
  `, "Your weekly update from St. Patrick in Armonk");
}
