import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "communications", "religious_ed", "youth_ministry", "sacraments", "parish_life"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * News posts / announcements managed by admin
 */
export const newsPosts = mysqlTable("news_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 1000 }),
  imageUrl: text("imageUrl"),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  authorId: int("authorId"),
});

export type NewsPost = typeof newsPosts.$inferSelect;
export type InsertNewsPost = typeof newsPosts.$inferInsert;

/**
 * Weekly bulletins (PDF uploads)
 */
export const bulletins = mysqlTable("bulletins", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: varchar("description", { length: 1000 }),
  pdfUrl: text("pdfUrl").notNull(),
  pdfKey: varchar("pdfKey", { length: 500 }).notNull(),
  sourceHtml: text("sourceHtml"),
  sourceMarkdown: text("sourceMarkdown"),
  weekDate: timestamp("weekDate").notNull(),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  authorId: int("authorId"),
  deletedAt: timestamp("deletedAt"),
});

export type Bulletin = typeof bulletins.$inferSelect;
export type InsertBulletin = typeof bulletins.$inferInsert;

/**
 * Parish events
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 500 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  allDay: boolean("allDay").default(false).notNull(),
  published: boolean("published").default(true).notNull(),
  googleCalendarEventId: varchar("googleCalendarEventId", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  authorId: int("authorId"),
});

export type ParishEvent = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Email subscriptions for parishioners
 */
export const emailSubscriptions = mysqlTable("email_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  subscribedToBulletins: boolean("subscribedToBulletins").default(true).notNull(),
  subscribedToNews: boolean("subscribedToNews").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
  unsubscribeToken: varchar("unsubscribeToken", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
export type InsertEmailSubscription = typeof emailSubscriptions.$inferInsert;

/**
 * CCD (Religious Education) Registrations
 */
export const ccdRegistrations = mysqlTable("ccd_registrations", {
  id: int("id").autoincrement().primaryKey(),
  // Parent/Guardian Info
  parentFirstName: varchar("parentFirstName", { length: 255 }).notNull(),
  parentLastName: varchar("parentLastName", { length: 255 }).notNull(),
  parentEmail: varchar("parentEmail", { length: 320 }).notNull(),
  parentPhone: varchar("parentPhone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  // Child Info
  childFirstName: varchar("childFirstName", { length: 255 }).notNull(),
  childLastName: varchar("childLastName", { length: 255 }).notNull(),
  childDob: timestamp("childDob").notNull(),
  grade: varchar("grade", { length: 20 }).notNull(),
  // Sacraments
  baptized: boolean("baptized").default(false).notNull(),
  baptismChurch: varchar("baptismChurch", { length: 500 }),
  firstCommunion: boolean("firstCommunion").default(false).notNull(),
  // Status
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "waitlisted", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  // Reminder preferences
  reminderOptIn: boolean("reminderOptIn").default(true).notNull(),
  unsubscribeToken: varchar("unsubscribeToken", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CcdRegistration = typeof ccdRegistrations.$inferSelect;
export type InsertCcdRegistration = typeof ccdRegistrations.$inferInsert;

/**
 * CYO Basketball Teams
 */
export const cyoTeams = mysqlTable("cyo_teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  division: varchar("division", { length: 100 }).notNull(),
  ageGroup: varchar("ageGroup", { length: 50 }).notNull(),
  season: varchar("season", { length: 20 }).notNull(),
  coachName: varchar("coachName", { length: 255 }),
  coachEmail: varchar("coachEmail", { length: 320 }),
  coachPhone: varchar("coachPhone", { length: 20 }),
  wins: int("wins").default(0).notNull(),
  losses: int("losses").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CyoTeam = typeof cyoTeams.$inferSelect;
export type InsertCyoTeam = typeof cyoTeams.$inferInsert;

/**
 * CYO Basketball Games
 */
export const cyoGames = mysqlTable("cyo_games", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  opponent: varchar("opponent", { length: 255 }).notNull(),
  gameDate: timestamp("gameDate").notNull(),
  location: varchar("location", { length: 500 }).notNull(),
  homeAway: mysqlEnum("homeAway", ["home", "away"]).default("home").notNull(),
  ourScore: int("ourScore"),
  theirScore: int("theirScore"),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "postponed"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CyoGame = typeof cyoGames.$inferSelect;
export type InsertCyoGame = typeof cyoGames.$inferInsert;

/**
 * Volunteer Opportunities
 */
export const volunteerOpportunities = mysqlTable("volunteer_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  ministry: varchar("ministry", { length: 255 }),
  eventDate: timestamp("eventDate"),
  startTime: varchar("startTime", { length: 20 }),
  endTime: varchar("endTime", { length: 20 }),
  spotsAvailable: int("spotsAvailable").default(0).notNull(),
  spotsFilled: int("spotsFilled").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VolunteerOpportunity = typeof volunteerOpportunities.$inferSelect;
export type InsertVolunteerOpportunity = typeof volunteerOpportunities.$inferInsert;

/**
 * Volunteer Sign-ups
 */
export const volunteerSignups = mysqlTable("volunteer_signups", {
  id: int("id").autoincrement().primaryKey(),
  opportunityId: int("opportunityId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["confirmed", "cancelled"]).default("confirmed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VolunteerSignup = typeof volunteerSignups.$inferSelect;
export type InsertVolunteerSignup = typeof volunteerSignups.$inferInsert;

/**
 * CCD Class Events - managed by admin, displayed on CCD Calendar
 */
export const ccdEvents = mysqlTable("ccd_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  endDate: timestamp("endDate"),
  eventType: mysqlEnum("eventType", ["class", "holiday", "special", "sacrament"]).default("class").notNull(),
  grade: varchar("grade", { length: 50 }),
  location: varchar("location", { length: 500 }),
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CcdEvent = typeof ccdEvents.$inferSelect;
export type InsertCcdEvent = typeof ccdEvents.$inferInsert;

/**
 * Parish documents and forms managed by admin
 * Categories: baptism, confirmation, marriage, funeral, ccd, general
 */
export const parishDocuments = mysqlTable("parish_documents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParishDocument = typeof parishDocuments.$inferSelect;
export type InsertParishDocument = typeof parishDocuments.$inferInsert;

// ===== DIGITAL FORM SUBMISSIONS =====

/**
 * Baptism Registration submissions
 */
export const baptismRegistrations = mysqlTable("baptism_registrations", {
  id: int("id").autoincrement().primaryKey(),
  // Child info
  childFirstName: varchar("childFirstName", { length: 200 }).notNull(),
  childLastName: varchar("childLastName", { length: 200 }).notNull(),
  childDob: varchar("childDob", { length: 20 }).notNull(),
  childGender: varchar("childGender", { length: 20 }).notNull(),
  // Parent info
  fatherName: varchar("fatherName", { length: 300 }),
  motherName: varchar("motherName", { length: 300 }),
  parentEmail: varchar("parentEmail", { length: 320 }).notNull(),
  parentPhone: varchar("parentPhone", { length: 30 }).notNull(),
  address: text("address").notNull(),
  // Godparents
  godparentName1: varchar("godparentName1", { length: 300 }),
  godparentName2: varchar("godparentName2", { length: 300 }),
  // Preferences
  preferredDate: varchar("preferredDate", { length: 50 }),
  birthCertUrl: text("birthCertUrl"),
  notes: text("notes"),
  // Status
  status: mysqlEnum("status", ["pending", "approved", "scheduled", "completed", "cancelled"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BaptismRegistration = typeof baptismRegistrations.$inferSelect;

/**
 * Sponsor Certificate submissions (for Baptism or Confirmation)
 */
export const sponsorCertificates = mysqlTable("sponsor_certificates", {
  id: int("id").autoincrement().primaryKey(),
  // Sponsor info
  sponsorFirstName: varchar("sponsorFirstName", { length: 200 }).notNull(),
  sponsorLastName: varchar("sponsorLastName", { length: 200 }).notNull(),
  sponsorEmail: varchar("sponsorEmail", { length: 320 }).notNull(),
  sponsorPhone: varchar("sponsorPhone", { length: 30 }).notNull(),
  sponsorAddress: text("sponsorAddress").notNull(),
  // Sponsor's parish
  sponsorParish: varchar("sponsorParish", { length: 300 }).notNull(),
  sponsorParishCity: varchar("sponsorParishCity", { length: 200 }).notNull(),
  // Sacrament details
  sacramentType: mysqlEnum("sacramentType", ["baptism", "confirmation"]).notNull(),
  candidateName: varchar("candidateName", { length: 300 }).notNull(),
  ceremonyDate: varchar("ceremonyDate", { length: 50 }),
  // Sponsor qualifications
  isBaptized: boolean("isBaptized").default(true).notNull(),
  isConfirmed: boolean("isConfirmed").default(true).notNull(),
  isActiveCatholic: boolean("isActiveCatholic").default(true).notNull(),
  notes: text("notes"),
  // Status
  status: mysqlEnum("status", ["pending", "verified", "approved", "denied"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SponsorCertificate = typeof sponsorCertificates.$inferSelect;

/**
 * Marriage Inquiry submissions
 */
export const marriageInquiries = mysqlTable("marriage_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  // Bride info
  brideFirstName: varchar("brideFirstName", { length: 200 }).notNull(),
  brideLastName: varchar("brideLastName", { length: 200 }).notNull(),
  brideEmail: varchar("brideEmail", { length: 320 }).notNull(),
  bridePhone: varchar("bridePhone", { length: 30 }).notNull(),
  brideReligion: varchar("brideReligion", { length: 100 }),
  brideParish: varchar("brideParish", { length: 300 }),
  // Groom info
  groomFirstName: varchar("groomFirstName", { length: 200 }).notNull(),
  groomLastName: varchar("groomLastName", { length: 200 }).notNull(),
  groomEmail: varchar("groomEmail", { length: 320 }),
  groomPhone: varchar("groomPhone", { length: 30 }),
  groomReligion: varchar("groomReligion", { length: 100 }),
  groomParish: varchar("groomParish", { length: 300 }),
  // Wedding details
  preferredDate: varchar("preferredDate", { length: 50 }),
  alternateDate: varchar("alternateDate", { length: 50 }),
  isParishioner: boolean("isParishioner").default(false).notNull(),
  previousMarriage: boolean("previousMarriage").default(false).notNull(),
  previousMarriageDetails: text("previousMarriageDetails"),
  guestCount: varchar("guestCount", { length: 20 }),
  notes: text("notes"),
  // Status
  status: mysqlEnum("status", ["pending", "in_review", "meeting_scheduled", "approved", "denied"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MarriageInquiry = typeof marriageInquiries.$inferSelect;

/**
 * Funeral Pre-Planning submissions
 */
export const funeralPrePlanning = mysqlTable("funeral_pre_planning", {
  id: int("id").autoincrement().primaryKey(),
  // Deceased/Planner info
  plannerName: varchar("plannerName", { length: 300 }).notNull(),
  plannerEmail: varchar("plannerEmail", { length: 320 }).notNull(),
  plannerPhone: varchar("plannerPhone", { length: 30 }).notNull(),
  plannerRelation: varchar("plannerRelation", { length: 100 }),
  deceasedName: varchar("deceasedName", { length: 300 }).notNull(),
  isPrePlanning: boolean("isPrePlanning").default(false).notNull(),
  // Liturgy preferences
  preferredDate: varchar("preferredDate", { length: 50 }),
  massType: mysqlEnum("massType", ["funeral_mass", "memorial_mass", "vigil_service", "graveside"]).default("funeral_mass").notNull(),
  firstReading: text("firstReading"),
  secondReading: text("secondReading"),
  gospel: text("gospel"),
  hymns: text("hymns"),
  eulogist: varchar("eulogist", { length: 300 }),
  pallbearers: text("pallbearers"),
  specialRequests: text("specialRequests"),
  // Status
  status: mysqlEnum("status", ["pending", "confirmed", "completed"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FuneralPrePlanning = typeof funeralPrePlanning.$inferSelect;

// Teen Life Registrations
export const teenLifeRegistrations = mysqlTable("teen_life_registrations", {
  id: int("id").autoincrement().primaryKey(),
  teenFirstName: varchar("teenFirstName", { length: 100 }).notNull(),
  teenLastName: varchar("teenLastName", { length: 100 }).notNull(),
  grade: varchar("grade", { length: 10 }).notNull(),
  school: varchar("school", { length: 200 }),
  parentName: varchar("parentName", { length: 200 }).notNull(),
  parentEmail: varchar("parentEmail", { length: 320 }).notNull(),
  parentPhone: varchar("parentPhone", { length: 20 }).notNull(),
  address: text("address"),
  interests: text("interests"),
  medicalNotes: text("medicalNotes"),
  emergencyContact: varchar("emergencyContact", { length: 200 }),
  emergencyPhone: varchar("emergencyPhone", { length: 20 }),
  photoConsent: int("photoConsent").default(0),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TeenLifeRegistration = typeof teenLifeRegistrations.$inferSelect;

// Parish Registrations (new parishioner sign-up)
export const parishRegistrations = mysqlTable("parish_registrations", {
  id: int("id").autoincrement().primaryKey(),
  headOfHousehold: varchar("headOfHousehold", { length: 200 }).notNull(),
  spouseName: varchar("spouseName", { length: 200 }),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 10 }).default("NY").notNull(),
  zip: varchar("zip", { length: 10 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  previousParish: varchar("previousParish", { length: 300 }),
  numChildren: varchar("numChildren", { length: 10 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "welcomed", "active"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ParishRegistration = typeof parishRegistrations.$inferSelect;

// CCD Permission & Release Forms (bus transport, early dismissal, photo release, medical, authorized pickup)
export const ccdPermissions = mysqlTable("ccd_permissions", {
  id: int("id").autoincrement().primaryKey(),
  // Link to CCD registration
  ccdRegistrationId: int("ccdRegistrationId"),
  // Child info
  childFirstName: varchar("childFirstName", { length: 200 }).notNull(),
  childLastName: varchar("childLastName", { length: 200 }).notNull(),
  childGrade: varchar("childGrade", { length: 20 }).notNull(),
  // Parent/Guardian info
  parentName: varchar("parentName", { length: 300 }).notNull(),
  parentPhone: varchar("parentPhone", { length: 30 }).notNull(),
  parentEmail: varchar("parentEmail", { length: 320 }).notNull(),
  // Bus Transportation
  needsBusTransport: boolean("needsBusTransport").default(false).notNull(),
  busPickupLocation: varchar("busPickupLocation", { length: 500 }),
  busDropoffLocation: varchar("busDropoffLocation", { length: 500 }),
  busNotes: text("busNotes"),
  // Early Dismissal
  earlyDismissalAuthorized: boolean("earlyDismissalAuthorized").default(false).notNull(),
  earlyDismissalReason: text("earlyDismissalReason"),
  earlyDismissalDates: text("earlyDismissalDates"),
  // Authorized Pickup Persons
  authorizedPickup1Name: varchar("authorizedPickup1Name", { length: 300 }).notNull(),
  authorizedPickup1Phone: varchar("authorizedPickup1Phone", { length: 30 }).notNull(),
  authorizedPickup1Relation: varchar("authorizedPickup1Relation", { length: 100 }).notNull(),
  authorizedPickup2Name: varchar("authorizedPickup2Name", { length: 300 }),
  authorizedPickup2Phone: varchar("authorizedPickup2Phone", { length: 30 }),
  authorizedPickup2Relation: varchar("authorizedPickup2Relation", { length: 100 }),
  authorizedPickup3Name: varchar("authorizedPickup3Name", { length: 300 }),
  authorizedPickup3Phone: varchar("authorizedPickup3Phone", { length: 30 }),
  authorizedPickup3Relation: varchar("authorizedPickup3Relation", { length: 100 }),
  // Medical/Allergy Information
  allergies: text("allergies"),
  medications: text("medications"),
  medicalConditions: text("medicalConditions"),
  doctorName: varchar("doctorName", { length: 300 }),
  doctorPhone: varchar("doctorPhone", { length: 30 }),
  insuranceProvider: varchar("insuranceProvider", { length: 300 }),
  insurancePolicyNumber: varchar("insurancePolicyNumber", { length: 100 }),
  // Emergency Contact (different from parent)
  emergencyContactName: varchar("emergencyContactName", { length: 300 }).notNull(),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 30 }).notNull(),
  emergencyContactRelation: varchar("emergencyContactRelation", { length: 100 }).notNull(),
  // Photo/Video Release
  photoReleaseConsent: boolean("photoReleaseConsent").default(false).notNull(),
  // Consent & Signature
  medicalReleaseConsent: boolean("medicalReleaseConsent").default(false).notNull(),
  parentSignature: varchar("parentSignature", { length: 300 }).notNull(),
  signatureDate: varchar("signatureDate", { length: 20 }).notNull(),
  // Status
  status: mysqlEnum("status", ["pending", "approved", "flagged"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  schoolYear: varchar("schoolYear", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CcdPermission = typeof ccdPermissions.$inferSelect;

/**
 * Important Dates - Key parish events for the year (from printed calendar)
 * These are high-level milestone dates displayed on the homepage
 */
export const importantDates = mysqlTable("important_dates", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  location: varchar("location", { length: 300 }),
  note: text("note"),
  category: mysqlEnum("category", ["ccd", "cyo", "sacrament", "parish", "teen_life", "social"]).default("parish").notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ImportantDate = typeof importantDates.$inferSelect;
export type InsertImportantDate = typeof importantDates.$inferInsert;

/**
 * Photo Gallery - parish event photos uploaded by admin
 */
export const galleryPhotos = mysqlTable("gallery_photos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }),
  caption: text("caption"),
  imageUrl: text("imageUrl").notNull(),
  imageKey: varchar("imageKey", { length: 500 }).notNull(),
  album: varchar("album", { length: 200 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertGalleryPhoto = typeof galleryPhotos.$inferInsert;

/**
 * Site settings — key/value store for admin-configurable site content
 * (marquee text, homepage messages, etc.)
 */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SiteSetting = typeof siteSettings.$inferSelect;

/**
 * Prayer Wall - "Light a Candle" intentions from parishioners
 */
export const prayerIntentions = mysqlTable("prayer_intentions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }),
  intention: text("intention").notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PrayerIntention = typeof prayerIntentions.$inferSelect;
export type InsertPrayerIntention = typeof prayerIntentions.$inferInsert;

/**
 * Parish FAQ — admin-editable knowledge base for the AI Parish Assistant.
 * Each entry is a question/answer pair that gets injected into the LLM context.
 */
export const parishFaqs = mysqlTable("parish_faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).default("general").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ParishFaq = typeof parishFaqs.$inferSelect;
export type InsertParishFaq = typeof parishFaqs.$inferInsert;

/**
 * Push notification subscriptions for browser Web Push API.
 * Stores the subscription endpoint and keys needed to send push notifications.
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userId: varchar("userId", { length: 255 }),
  /** Comma-separated category list: mass_reminders,bulletin,closures,events,announcements */
  categories: varchar("categories", { length: 500 }).default("mass_reminders,bulletin,closures,events,announcements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;


/**
 * Prayer support — tracks "I prayed for this" interactions on prayer intentions.
 */
export const prayerSupport = mysqlTable("prayer_support", {
  id: int("id").autoincrement().primaryKey(),
  intentionId: int("intentionId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PrayerSupportRow = typeof prayerSupport.$inferSelect;
export type InsertPrayerSupport = typeof prayerSupport.$inferInsert;

/**
 * Volunteer Needs Board — urgent/time-sensitive needs posted by admin.
 * Different from volunteer_opportunities: these are immediate, short-term requests.
 */
export const volunteerNeeds = mysqlTable("volunteer_needs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  urgency: mysqlEnum("urgency", ["low", "medium", "high"]).default("medium").notNull(),
  category: varchar("category", { length: 100 }),
  neededBy: timestamp("neededBy"),
  spotsNeeded: int("spotsNeeded").default(1).notNull(),
  spotsFilled: int("spotsFilled").default(0).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type VolunteerNeed = typeof volunteerNeeds.$inferSelect;
export type InsertVolunteerNeed = typeof volunteerNeeds.$inferInsert;

/**
 * Volunteer Needs Responses — one-click signups for urgent needs.
 */
export const volunteerNeedResponses = mysqlTable("volunteer_need_responses", {
  id: int("id").autoincrement().primaryKey(),
  needId: int("needId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type VolunteerNeedResponse = typeof volunteerNeedResponses.$inferSelect;
export type InsertVolunteerNeedResponse = typeof volunteerNeedResponses.$inferInsert;

/**
 * Audit Log — records admin actions for accountability and debugging.
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  userName: varchar("userName", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "approve", "reject", "delete", "update"
  entityType: varchar("entityType", { length: 100 }).notNull(), // e.g., "sacrament", "bulletin", "event"
  entityId: varchar("entityId", { length: 100 }), // ID of the affected record
  details: text("details"), // JSON string with additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Homily Archive — recordings and metadata for past homilies.
 */
export const homilies = mysqlTable("homilies", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  date: timestamp("date").notNull(),
  celebrant: varchar("celebrant", { length: 200 }),
  topic: varchar("topic", { length: 200 }),
  audioUrl: text("audioUrl"),
  audioKey: varchar("audioKey", { length: 500 }),
  notes: text("notes"),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Homily = typeof homilies.$inferSelect;
export type InsertHomily = typeof homilies.$inferInsert;


/**
 * Saint of the Day Streaks — tracks daily visits for gamification.
 */
export const saintStreaks = mysqlTable("saint_streaks", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 255 }).notNull(),
  currentStreak: int("current_streak").default(0).notNull(),
  longestStreak: int("longest_streak").default(0).notNull(),
  lastVisitDate: varchar("last_visit_date", { length: 10 }).notNull(), // YYYY-MM-DD
  totalVisits: int("total_visits").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type SaintStreak = typeof saintStreaks.$inferSelect;

/**
 * Mass Intentions — parishioner requests for Mass to be offered for a specific intention.
 */
export const massIntentions = mysqlTable("mass_intentions", {
  id: int("id").autoincrement().primaryKey(),
  requesterName: varchar("requester_name", { length: 255 }).notNull(),
  requesterEmail: varchar("requester_email", { length: 255 }).notNull(),
  requesterPhone: varchar("requester_phone", { length: 50 }),
  intentionFor: varchar("intention_for", { length: 500 }).notNull(),
  intentionType: varchar("intention_type", { length: 50 }).notNull(),
  preferredDate: varchar("preferred_date", { length: 50 }),
  preferredMass: varchar("preferred_mass", { length: 100 }),
  notes: text("notes"),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  scheduledMass: varchar("scheduled_mass", { length: 100 }),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type MassIntention = typeof massIntentions.$inferSelect;
export type InsertMassIntention = typeof massIntentions.$inferInsert;

// Staff Directory
export const staffMembers = mysqlTable("staff_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  role: varchar("role", { length: 300 }).notNull(),
  category: mysqlEnum("category", ["clergy", "staff", "leadership", "ministry_leader", "emeritus"]).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type StaffMemberRow = typeof staffMembers.$inferSelect;
export type InsertStaffMember = typeof staffMembers.$inferInsert;

// Holy Days of Obligation & Special Mass Times
export const holyDays = mysqlTable("holy_days", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 300 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  massTimes: json("mass_times").$type<string[]>().notNull(), // ["8:30 AM", "12:10 PM", "7:30 PM"]
  category: mysqlEnum("category", ["holy_day", "special_mass", "seasonal", "parish_feast", "triduum", "other"]).default("holy_day").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HolyDayRow = typeof holyDays.$inferSelect;
export type InsertHolyDay = typeof holyDays.$inferInsert;
