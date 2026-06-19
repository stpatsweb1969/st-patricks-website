/**
 * Form Export Router — exports form submissions to Google Sheets.
 * Admin can trigger export of recent submissions to a configured spreadsheet.
 * Uses the GWS CLI via child_process (sandbox only) or stores export data for agent use.
 * ~100 lines
 */
import { router, z, db, TRPCError, sectionProcedure } from "./_helpers";
const formExportSection = sectionProcedure("form_export");
import { getSiteSetting, upsertSiteSetting } from "../db";

export const formExportRouter = router({
  /** Get the configured Google Sheets spreadsheet ID */
  getConfig: formExportSection.query(async () => {
    const spreadsheetId = await getSiteSetting("form_export_spreadsheet_id");
    return { spreadsheetId: spreadsheetId || null };
  }),

  /** Set the Google Sheets spreadsheet ID for form exports */
  setConfig: formExportSection.input(z.object({
    spreadsheetId: z.string().min(1),
  })).mutation(async ({ input }) => {
    await upsertSiteSetting("form_export_spreadsheet_id", input.spreadsheetId);
    return { success: true };
  }),

  /** Get recent form submissions ready for export */
  getRecentSubmissions: formExportSection.input(z.object({
    type: z.enum(["baptism", "sponsor", "marriage", "funeral", "teenLife", "parishRegistration", "ccdRegistration"]),
    limit: z.number().min(1).max(100).default(50),
  })).query(async ({ input }) => {
    switch (input.type) {
      case "baptism":
        return { type: "baptism", data: await db.getBaptismRegistrations() };
      case "sponsor":
        return { type: "sponsor", data: await db.getSponsorCertificates() };
      case "marriage":
        return { type: "marriage", data: await db.getMarriageInquiries() };
      case "funeral":
        return { type: "funeral", data: await db.getFuneralPrePlannings() };
      case "teenLife":
        return { type: "teenLife", data: await db.getTeenLifeRegistrations() };
      case "parishRegistration":
        return { type: "parishRegistration", data: await db.getParishRegistrations() };
      case "ccdRegistration":
        return { type: "ccdRegistration", data: await db.getCcdRegistrations() };
      default:
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown form type" });
    }
  }),

  /** Export submissions as CSV data (for download or Sheets push) */
  exportCsv: formExportSection.input(z.object({
    type: z.enum(["baptism", "sponsor", "marriage", "funeral", "teenLife", "parishRegistration", "ccdRegistration"]),
  })).mutation(async ({ input }) => {
    let data: Record<string, unknown>[] = [];
    switch (input.type) {
      case "baptism": data = await db.getBaptismRegistrations(); break;
      case "sponsor": data = await db.getSponsorCertificates(); break;
      case "marriage": data = await db.getMarriageInquiries(); break;
      case "funeral": data = await db.getFuneralPrePlannings(); break;
      case "teenLife": data = await db.getTeenLifeRegistrations(); break;
      case "parishRegistration": data = await db.getParishRegistrations(); break;
      case "ccdRegistration": data = await db.getCcdRegistrations(); break;
    }

    if (data.length === 0) return { csv: "", rowCount: 0 };

    // Generate CSV
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(h => {
        const val = (row as any)[h];
        if (val === null || val === undefined) return "";
        if (val instanceof Date) return val.toISOString();
        const str = String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    return { csv, rowCount: data.length };
  }),
});
