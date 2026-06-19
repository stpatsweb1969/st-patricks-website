// Database query helpers - organized by domain
// Each module is 30-150 lines for easy Claude review

export { getDb } from "./_connection";

// Users & Auth
export { upsertUser, getUserByOpenId, getAllUsers, updateUserRole } from "./users";

// News Posts
export { createNewsPost, updateNewsPost, deleteNewsPost, getPublishedNewsPosts, getAllNewsPosts, getNewsPostById } from "./news";

// Bulletins
export { createBulletin, updateBulletin, deleteBulletin, restoreBulletin, getDeletedBulletins, getPublishedBulletins, getAllBulletins, getBulletinById } from "./bulletins";

// Events
export { createEvent, updateEvent, deleteEvent, getUpcomingEvents, getAllEvents, getEventById } from "./events";

// Email Subscriptions
export { createSubscription, getSubscriptionByEmail, getActiveSubscribers, unsubscribeByToken, getAllSubscriptions } from "./subscriptions";

// CCD (Registrations, Events, Permissions)
export { createCcdRegistration, getCcdRegistrations, updateCcdRegistrationStatus, getCcdEvents, createCcdEvent, updateCcdEvent, deleteCcdEvent, createCcdPermission, getCcdPermissions, updateCcdPermissionStatus, getCcdReminderParents, getUpcomingCcdEvents, unsubscribeCcdReminder } from "./ccd";

// CYO Basketball
export { createCyoTeam, getCyoTeams, updateCyoTeam, deleteCyoTeam, createCyoGame, getCyoGames, updateCyoGame, deleteCyoGame } from "./cyo";

// Volunteer
export { createVolunteerOpportunity, getVolunteerOpportunities, updateVolunteerOpportunity, deleteVolunteerOpportunity, createVolunteerSignup, getVolunteerSignups, cancelVolunteerSignup } from "./volunteer";

// Digital Forms (Baptism, Sponsor, Marriage, Funeral, Teen Life, Parish Registration)
export { createBaptismRegistration, getBaptismRegistrations, updateBaptismStatus, createSponsorCertificate, getSponsorCertificates, updateSponsorStatus, createMarriageInquiry, getMarriageInquiries, updateMarriageStatus, createFuneralPrePlanning, getFuneralPrePlannings, updateFuneralStatus, createTeenLifeRegistration, getTeenLifeRegistrations, updateTeenLifeRegistrationStatus, createParishRegistration, getParishRegistrations, updateParishRegistrationStatus, getBaptismContactInfo, getSponsorContactInfo, getMarriageContactInfo, getFuneralContactInfo } from "./forms";

// Parish Documents
export { getDocuments, createDocument, updateDocument, deleteDocument, getDocumentsByCategory, getAllDocuments } from "./documents";

// Important Dates
export { getUpcomingImportantDates, getAllPublishedImportantDates, getAllImportantDates, createImportantDate, updateImportantDate, deleteImportantDate } from "./importantDates";

// Gallery
export { getPublishedGalleryPhotos, getAllGalleryPhotos, createGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto, getGalleryAlbums } from "./gallery";

// Admin Stats, Settings, Prayer Wall, Activity Feed
export { getAdminStats, getSiteSetting, upsertSiteSetting, getAllSiteSettings, createPrayerIntention, getRecentPrayerIntentions, getPrayerIntentionCount, getRecentFormSubmissions, getPendingSubmissions, bulkUpdateStatus, updateAdminNote } from "./admin";

// Parish FAQs (AI Assistant knowledge base)
export { getActiveFaqs, getAllFaqs, createFaq, updateFaq, deleteFaq } from "./faqs";

// Volunteer Needs Board
export { getActiveVolunteerNeeds, getAllVolunteerNeeds, createVolunteerNeed, updateVolunteerNeed, getVolunteerNeedResponses, createVolunteerNeedResponse } from "./volunteerNeeds";

// Prayer Support ("I prayed for this")
export { addPrayerSupport, getPrayerSupportCount, getPrayerSupportCounts, hasUserPrayed } from "./prayerSupport";

// Homily Archive
export { getPublishedHomilies, getAllHomilies, createHomily, deleteHomily, updateHomily } from "./homilies";

// Saint of the Day Streaks
export { getStreak, recordVisit } from "./saintStreaks";
export { createMassIntention, getMassIntentions, updateMassIntentionStatus } from "./massIntentions";

// Audit Logs
export { createAuditLog, getAuditLogs } from "./auditLog";

// Unified Sacrament Submissions
export { getAllSacramentSubmissions } from "./sacramentSubmissions";

// Holy Days
export { getAllHolyDays, getUpcomingHolyDays, upsertHolyDay, deleteHolyDay } from "./holyDays";
