/**
 * Role-based access control for the admin dashboard.
 * 
 * Roles:
 * - admin: Full access to everything (Pastor, Parish Admin)
 * - communications: News, Bulletins, Subscribers, Photo Gallery
 * - religious_ed: CCD Registrations, CCD Calendar, CCD Permissions, Documents
 * - youth_ministry: CYO Teams/Games, Teen Life Registrations
 * - sacraments: Baptism, Marriage, Funeral, Sponsor Certificates
 * - parish_life: Events, Volunteers, Key Dates, Parish Registrations
 * - user: No admin access
 */

export type UserRole = "user" | "admin" | "communications" | "religious_ed" | "youth_ministry" | "sacraments" | "parish_life";

export type AdminSection = 
  | "dashboard"
  | "news"
  | "bulletins"
  | "subscribers"
  | "gallery"
  | "events"
  | "calendar"
  | "key_dates"
  | "volunteers"
  | "registrations"
  | "ccd_registrations"
  | "ccd_calendar"
  | "ccd_permissions"
  | "cyo"
  | "teen_life"
  | "sacraments"
  | "documents"
  | "users"
  | "settings"
  | "form_export"
  | "faq";

/**
 * Maps each role to the sections they can access.
 * Admin has access to everything.
 */
export const ROLE_PERMISSIONS: Record<UserRole, AdminSection[]> = {
  admin: [
    "dashboard", "news", "bulletins", "subscribers", "gallery",
    "events", "calendar", "key_dates", "volunteers", "registrations",
    "ccd_registrations", "ccd_calendar", "ccd_permissions",
    "cyo", "teen_life", "sacraments", "documents", "users", "settings", "form_export", "faq"
  ],
  communications: ["dashboard", "news", "bulletins", "subscribers", "gallery"],
  religious_ed: ["dashboard", "ccd_registrations", "ccd_calendar", "ccd_permissions", "documents"],
  youth_ministry: ["dashboard", "cyo", "teen_life"],
  sacraments: ["dashboard", "sacraments"],
  parish_life: ["dashboard", "events", "calendar", "key_dates", "volunteers", "registrations"],
  user: [],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  communications: "Communications",
  religious_ed: "Religious Education",
  youth_ministry: "Youth Ministry",
  sacraments: "Sacraments",
  parish_life: "Parish Life",
  user: "Parishioner",
};

export function hasAccess(role: UserRole, section: AdminSection): boolean {
  return ROLE_PERMISSIONS[role]?.includes(section) ?? false;
}

export function isStaffRole(role: UserRole): boolean {
  return role !== "user";
}
