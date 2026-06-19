import { eq, desc, sql, gte, and, isNull } from "drizzle-orm";
import { newsPosts, events, emailSubscriptions, ccdRegistrations, volunteerSignups, galleryPhotos, parishRegistrations, baptismRegistrations, marriageInquiries, teenLifeRegistrations, ccdPermissions, siteSettings, prayerIntentions, massIntentions, volunteerNeeds, sponsorCertificates, funeralPrePlanning, bulletins, staffMembers } from "../../drizzle/schema";
import { getDb } from "./_connection";

// ===== ADMIN STATS =====

export async function getAdminStats() {
  const db = await getDb();
  const [newsCount] = await db!.select({ count: sql<number>`count(*)` }).from(newsPosts);
  const [eventsCount] = await db!.select({ count: sql<number>`count(*)` }).from(events);
  const [subscriberCount] = await db!.select({ count: sql<number>`count(*)` }).from(emailSubscriptions).where(eq(emailSubscriptions.active, true));
  const [ccdCount] = await db!.select({ count: sql<number>`count(*)` }).from(ccdRegistrations).where(eq(ccdRegistrations.status, "pending"));
  const [volunteerCount] = await db!.select({ count: sql<number>`count(*)` }).from(volunteerSignups);
  const [galleryCount] = await db!.select({ count: sql<number>`count(*)` }).from(galleryPhotos);
  const [parishRegCount] = await db!.select({ count: sql<number>`count(*)` }).from(parishRegistrations).where(eq(parishRegistrations.status, "pending"));
  const [baptismCount] = await db!.select({ count: sql<number>`count(*)` }).from(baptismRegistrations).where(eq(baptismRegistrations.status, "pending"));
  const [marriageCount] = await db!.select({ count: sql<number>`count(*)` }).from(marriageInquiries).where(eq(marriageInquiries.status, "pending"));
  const [teenLifeCount] = await db!.select({ count: sql<number>`count(*)` }).from(teenLifeRegistrations).where(eq(teenLifeRegistrations.status, "pending"));
  const [massIntentionCount] = await db!.select({ count: sql<number>`count(*)` }).from(massIntentions).where(eq(massIntentions.status, "pending"));
  // Volunteer needs: active + unfilled
  const [volunteerNeedsCount] = await db!.select({ count: sql<number>`count(*)` }).from(volunteerNeeds).where(and(eq(volunteerNeeds.active, true), sql`${volunteerNeeds.spotsFilled} < ${volunteerNeeds.spotsNeeded}`));
  // Unread generic submissions (sponsor certs + funeral pre-planning pending)
  const [sponsorPendingCount] = await db!.select({ count: sql<number>`count(*)` }).from(sponsorCertificates).where(eq(sponsorCertificates.status, "pending"));
  const [funeralPendingCount] = await db!.select({ count: sql<number>`count(*)` }).from(funeralPrePlanning).where(eq(funeralPrePlanning.status, "pending"));
  // CCD Permissions pending
  const [ccdPermCount] = await db!.select({ count: sql<number>`count(*)` }).from(ccdPermissions).where(eq(ccdPermissions.status, "pending"));
  // Extended counts (D1)
  const [bulletinCount] = await db!.select({ count: sql<number>`count(*)` }).from(bulletins).where(isNull(bulletins.deletedAt));
  const [prayerCount] = await db!.select({ count: sql<number>`count(*)` }).from(prayerIntentions);
  const [staffCount] = await db!.select({ count: sql<number>`count(*)` }).from(staffMembers);
  const [totalParishReg] = await db!.select({ count: sql<number>`count(*)` }).from(parishRegistrations);

  return {
    totalNews: newsCount.count,
    totalEvents: eventsCount.count,
    activeSubscribers: subscriberCount.count,
    pendingCcdRegistrations: ccdCount.count,
    totalVolunteerSignups: volunteerCount.count,
    totalGalleryPhotos: galleryCount.count,
    pendingParishRegistrations: parishRegCount.count,
    pendingBaptisms: baptismCount.count,
    pendingMarriages: marriageCount.count,
    pendingTeenLife: teenLifeCount.count,
    pendingMassIntentions: massIntentionCount.count,
    unfilledVolunteerNeeds: volunteerNeedsCount.count,
    pendingSponsorCerts: sponsorPendingCount.count,
    pendingFunerals: funeralPendingCount.count,
    totalBulletins: bulletinCount.count,
    totalPrayerIntentions: prayerCount.count,
    totalStaff: staffCount.count,
    totalParishRegistrations: totalParishReg.count,
    pendingCcdPermissions: ccdPermCount.count,
  };
}

// ===== SITE SETTINGS =====

export async function getSiteSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

export async function upsertSiteSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value });
  }
}

export async function getAllSiteSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings);
}

// ===== PRAYER WALL =====

export async function createPrayerIntention(data: { name?: string; intention: string; isPublic?: boolean }) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(prayerIntentions).values({
    name: data.name || null,
    intention: data.intention,
    isPublic: data.isPublic ?? true,
  });
  return result.insertId;
}

export async function getRecentPrayerIntentions(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(prayerIntentions)
    .where(eq(prayerIntentions.isPublic, true))
    .orderBy(desc(prayerIntentions.createdAt))
    .limit(limit);
}

export async function getPrayerIntentionCount() {
  const db = await getDb();
  if (!db) return 0;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [result] = await db.select({ count: sql<number>`count(*)` })
    .from(prayerIntentions)
    .where(gte(prayerIntentions.createdAt, sevenDaysAgo));
  return result.count;
}

// ===== RECENT FORM SUBMISSIONS (Activity Feed) =====

export async function getRecentFormSubmissions(limit = 15) {
  const db = await getDb();
  if (!db) return [];

  const [baptisms, marriages, ccdRegs, parishRegs, teenLife, permissions] = await Promise.all([
    db.select({
      id: baptismRegistrations.id,
      name: sql<string>`CONCAT(${baptismRegistrations.childFirstName}, ' ', ${baptismRegistrations.childLastName})`,
      status: baptismRegistrations.status,
      createdAt: baptismRegistrations.createdAt,
    }).from(baptismRegistrations).orderBy(desc(baptismRegistrations.createdAt)).limit(5),

    db.select({
      id: marriageInquiries.id,
      name: sql<string>`CONCAT(${marriageInquiries.brideFirstName}, ' ', ${marriageInquiries.brideLastName}, ' & ', ${marriageInquiries.groomFirstName}, ' ', ${marriageInquiries.groomLastName})`,
      status: marriageInquiries.status,
      createdAt: marriageInquiries.createdAt,
    }).from(marriageInquiries).orderBy(desc(marriageInquiries.createdAt)).limit(5),

    db.select({
      id: ccdRegistrations.id,
      name: sql<string>`CONCAT(${ccdRegistrations.childFirstName}, ' ', ${ccdRegistrations.childLastName})`,
      status: ccdRegistrations.status,
      createdAt: ccdRegistrations.createdAt,
    }).from(ccdRegistrations).orderBy(desc(ccdRegistrations.createdAt)).limit(5),

    db.select({
      id: parishRegistrations.id,
      name: parishRegistrations.headOfHousehold,
      status: parishRegistrations.status,
      createdAt: parishRegistrations.createdAt,
    }).from(parishRegistrations).orderBy(desc(parishRegistrations.createdAt)).limit(5),

    db.select({
      id: teenLifeRegistrations.id,
      name: sql<string>`CONCAT(${teenLifeRegistrations.teenFirstName}, ' ', ${teenLifeRegistrations.teenLastName})`,
      status: teenLifeRegistrations.status,
      createdAt: teenLifeRegistrations.createdAt,
    }).from(teenLifeRegistrations).orderBy(desc(teenLifeRegistrations.createdAt)).limit(5),

    db.select({
      id: ccdPermissions.id,
      name: sql<string>`CONCAT(${ccdPermissions.childFirstName}, ' ', ${ccdPermissions.childLastName})`,
      status: sql<string>`'submitted'`,
      createdAt: ccdPermissions.createdAt,
    }).from(ccdPermissions).orderBy(desc(ccdPermissions.createdAt)).limit(5),
  ]);

  const all = [
    ...baptisms.map(r => ({ ...r, type: "baptism" as const })),
    ...marriages.map(r => ({ ...r, type: "marriage" as const })),
    ...ccdRegs.map(r => ({ ...r, type: "ccd" as const })),
    ...parishRegs.map(r => ({ ...r, type: "parish_registration" as const })),
    ...teenLife.map(r => ({ ...r, type: "teen_life" as const })),
    ...permissions.map(r => ({ ...r, type: "ccd_permission" as const })),
  ];

  all.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  return all.slice(0, limit);
}

// ===== NEEDS ATTENTION (Pending Submissions) =====

export async function getPendingSubmissions() {
  const db = await getDb();
  if (!db) return [];

  const [baptisms, marriages, ccdRegs, parishRegs, teenLife, permissions, sponsorCerts, funerals, intentions] = await Promise.all([
    db.select({
      id: baptismRegistrations.id,
      name: sql<string>`CONCAT(${baptismRegistrations.childFirstName}, ' ', ${baptismRegistrations.childLastName})`,
      status: baptismRegistrations.status,
      adminNotes: baptismRegistrations.adminNotes,
      createdAt: baptismRegistrations.createdAt,
    }).from(baptismRegistrations).where(eq(baptismRegistrations.status, "pending")),

    db.select({
      id: marriageInquiries.id,
      name: sql<string>`CONCAT(${marriageInquiries.brideFirstName}, ' & ', ${marriageInquiries.groomFirstName})`,
      status: marriageInquiries.status,
      adminNotes: marriageInquiries.adminNotes,
      createdAt: marriageInquiries.createdAt,
    }).from(marriageInquiries).where(eq(marriageInquiries.status, "pending")),

    db.select({
      id: ccdRegistrations.id,
      name: sql<string>`CONCAT(${ccdRegistrations.childFirstName}, ' ', ${ccdRegistrations.childLastName})`,
      status: ccdRegistrations.status,
      adminNotes: ccdRegistrations.notes,
      createdAt: ccdRegistrations.createdAt,
    }).from(ccdRegistrations).where(eq(ccdRegistrations.status, "pending")),

    db.select({
      id: parishRegistrations.id,
      name: parishRegistrations.headOfHousehold,
      status: parishRegistrations.status,
      adminNotes: parishRegistrations.adminNotes,
      createdAt: parishRegistrations.createdAt,
    }).from(parishRegistrations).where(eq(parishRegistrations.status, "pending")),

    db.select({
      id: teenLifeRegistrations.id,
      name: sql<string>`CONCAT(${teenLifeRegistrations.teenFirstName}, ' ', ${teenLifeRegistrations.teenLastName})`,
      status: teenLifeRegistrations.status,
      adminNotes: teenLifeRegistrations.adminNotes,
      createdAt: teenLifeRegistrations.createdAt,
    }).from(teenLifeRegistrations).where(eq(teenLifeRegistrations.status, "pending")),

    db.select({
      id: ccdPermissions.id,
      name: sql<string>`CONCAT(${ccdPermissions.childFirstName}, ' ', ${ccdPermissions.childLastName})`,
      status: sql<string>`'pending'`,
      adminNotes: sql<string | null>`NULL`,
      createdAt: ccdPermissions.createdAt,
    }).from(ccdPermissions),

    db.select({
      id: sponsorCertificates.id,
      name: sql<string>`CONCAT(${sponsorCertificates.sponsorFirstName}, ' ', ${sponsorCertificates.sponsorLastName})`,
      status: sponsorCertificates.status,
      adminNotes: sponsorCertificates.adminNotes,
      createdAt: sponsorCertificates.createdAt,
    }).from(sponsorCertificates).where(eq(sponsorCertificates.status, "pending")),

    db.select({
      id: funeralPrePlanning.id,
      name: funeralPrePlanning.deceasedName,
      status: funeralPrePlanning.status,
      adminNotes: funeralPrePlanning.adminNotes,
      createdAt: funeralPrePlanning.createdAt,
    }).from(funeralPrePlanning).where(eq(funeralPrePlanning.status, "pending")),

    db.select({
      id: massIntentions.id,
      name: massIntentions.intentionFor,
      status: massIntentions.status,
      adminNotes: massIntentions.adminNotes,
      createdAt: massIntentions.createdAt,
    }).from(massIntentions).where(eq(massIntentions.status, "pending")),
  ]);

  const all = [
    ...baptisms.map(r => ({ ...r, type: "baptism" as const })),
    ...marriages.map(r => ({ ...r, type: "marriage" as const })),
    ...ccdRegs.map(r => ({ ...r, type: "ccd" as const })),
    ...parishRegs.map(r => ({ ...r, type: "parish_registration" as const })),
    ...teenLife.map(r => ({ ...r, type: "teen_life" as const })),
    ...permissions.map(r => ({ ...r, type: "ccd_permission" as const })),
    ...sponsorCerts.map(r => ({ ...r, type: "sponsor_cert" as const })),
    ...funerals.map(r => ({ ...r, type: "funeral" as const })),
    ...intentions.map(r => ({ ...r, type: "mass_intention" as const })),
  ];

  all.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  return all;
}

// Map type to table for bulk operations
const tableMap: Record<string, any> = {
  baptism: baptismRegistrations,
  marriage: marriageInquiries,
  ccd: ccdRegistrations,
  parish_registration: parishRegistrations,
  teen_life: teenLifeRegistrations,
  sponsor_cert: sponsorCertificates,
  funeral: funeralPrePlanning,
  mass_intention: massIntentions,
};

// CCD uses 'notes' field instead of 'adminNotes'
const noteFieldMap: Record<string, string> = {
  ccd: "notes",
};

export async function bulkUpdateStatus(items: { type: string; id: number }[], status: string) {
  const db = await getDb();
  if (!db) return 0;

  let updated = 0;
  for (const item of items) {
    const table = tableMap[item.type];
    if (!table) continue;
    await db.update(table).set({ status }).where(eq(table.id, item.id));
    updated++;
  }
  return updated;
}

export async function updateAdminNote(type: string, id: number, note: string) {
  const db = await getDb();
  if (!db) return;

  const table = tableMap[type];
  if (!table) return;
  const field = noteFieldMap[type] || "adminNotes";
  await db.update(table).set({ [field]: note }).where(eq(table.id, id));
}
