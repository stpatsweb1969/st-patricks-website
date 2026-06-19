/**
 * Unified sacrament submissions query — aggregates all 4 sacrament tables
 * into one typed shape for the admin unified view.
 */
import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { baptismRegistrations, sponsorCertificates, marriageInquiries, funeralPrePlanning } from "../../drizzle/schema";
import { getDb } from "./_connection";
import { rawStatusToStage } from "../../shared/sacramentStages";
import type { SacramentSubmissionRow } from "../../shared/sacramentStages";

export async function getAllSacramentSubmissions(): Promise<SacramentSubmissionRow[]> {
  const db = await getDb();
  if (!db) return [];

  const [baptisms, sponsors, marriages, funerals] = await Promise.all([
    db.select({
      id: baptismRegistrations.id,
      name: sql<string>`CONCAT(${baptismRegistrations.childFirstName}, ' ', ${baptismRegistrations.childLastName})`,
      email: baptismRegistrations.parentEmail,
      phone: baptismRegistrations.parentPhone,
      submittedAt: baptismRegistrations.createdAt,
      preferredDate: baptismRegistrations.preferredDate,
      rawStatus: baptismRegistrations.status,
    }).from(baptismRegistrations).orderBy(desc(baptismRegistrations.createdAt)),

    db.select({
      id: sponsorCertificates.id,
      name: sql<string>`CONCAT(${sponsorCertificates.sponsorFirstName}, ' ', ${sponsorCertificates.sponsorLastName})`,
      email: sponsorCertificates.sponsorEmail,
      phone: sponsorCertificates.sponsorPhone,
      submittedAt: sponsorCertificates.createdAt,
      preferredDate: sponsorCertificates.ceremonyDate,
      rawStatus: sponsorCertificates.status,
    }).from(sponsorCertificates).orderBy(desc(sponsorCertificates.createdAt)),

    db.select({
      id: marriageInquiries.id,
      name: sql<string>`CONCAT(${marriageInquiries.brideFirstName}, ' ', ${marriageInquiries.brideLastName}, ' & ', ${marriageInquiries.groomFirstName}, ' ', ${marriageInquiries.groomLastName})`,
      email: marriageInquiries.brideEmail,
      phone: marriageInquiries.bridePhone,
      submittedAt: marriageInquiries.createdAt,
      preferredDate: marriageInquiries.preferredDate,
      rawStatus: marriageInquiries.status,
    }).from(marriageInquiries).orderBy(desc(marriageInquiries.createdAt)),

    db.select({
      id: funeralPrePlanning.id,
      name: funeralPrePlanning.deceasedName,
      email: funeralPrePlanning.plannerEmail,
      phone: funeralPrePlanning.plannerPhone,
      submittedAt: funeralPrePlanning.createdAt,
      preferredDate: funeralPrePlanning.preferredDate,
      rawStatus: funeralPrePlanning.status,
      isPrePlanning: funeralPrePlanning.isPrePlanning,
    }).from(funeralPrePlanning).orderBy(desc(funeralPrePlanning.createdAt)),
  ]);

  const rows: SacramentSubmissionRow[] = [
    ...baptisms.map(r => ({
      id: r.id,
      type: "baptism" as const,
      name: r.name,
      email: r.email,
      phone: r.phone,
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date().toISOString(),
      preferredDate: r.preferredDate || null,
      rawStatus: r.rawStatus,
      stage: rawStatusToStage(r.rawStatus),
      urgent: false,
    })),
    ...sponsors.map(r => ({
      id: r.id,
      type: "sponsor" as const,
      name: r.name,
      email: r.email,
      phone: r.phone,
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date().toISOString(),
      preferredDate: r.preferredDate || null,
      rawStatus: r.rawStatus,
      stage: rawStatusToStage(r.rawStatus),
      urgent: false,
    })),
    ...marriages.map(r => ({
      id: r.id,
      type: "marriage" as const,
      name: r.name,
      email: r.email,
      phone: r.phone,
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date().toISOString(),
      preferredDate: r.preferredDate || null,
      rawStatus: r.rawStatus,
      stage: rawStatusToStage(r.rawStatus),
      urgent: false,
    })),
    ...funerals.map(r => ({
      id: r.id,
      type: "funeral" as const,
      name: r.name,
      email: r.email,
      phone: r.phone,
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date().toISOString(),
      preferredDate: r.preferredDate || null,
      rawStatus: r.rawStatus,
      stage: rawStatusToStage(r.rawStatus),
      urgent: !r.isPrePlanning,
    })),
  ];

  // Default sort: newest first
  rows.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  return rows;
}
