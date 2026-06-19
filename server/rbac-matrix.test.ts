/**
 * RBAC Permission Matrix — regression test.
 * Verifies that each role can access exactly the sections it should,
 * and cannot access anything else.
 */
import { describe, it, expect } from "vitest";
import { hasAccess, ROLE_PERMISSIONS, type UserRole, type AdminSection } from "../shared/roles";

const ALL_SECTIONS: AdminSection[] = [
  "dashboard", "news", "bulletins", "subscribers", "gallery",
  "events", "calendar", "key_dates", "volunteers", "registrations",
  "ccd_registrations", "ccd_calendar", "ccd_permissions",
  "cyo", "teen_life", "sacraments", "documents", "users", "settings", "form_export", "faq"
];

const ALL_ROLES: UserRole[] = [
  "admin", "communications", "religious_ed", "youth_ministry", "sacraments", "parish_life", "user"
];

describe("RBAC Permission Matrix", () => {
  it("admin has access to all sections", () => {
    for (const section of ALL_SECTIONS) {
      expect(hasAccess("admin", section)).toBe(true);
    }
  });

  it("communications can access only dashboard, news, bulletins, subscribers, gallery", () => {
    const allowed: AdminSection[] = ["dashboard", "news", "bulletins", "subscribers", "gallery"];
    for (const section of ALL_SECTIONS) {
      expect(hasAccess("communications", section)).toBe(allowed.includes(section));
    }
  });

  it("communications CANNOT access settings", () => {
    expect(hasAccess("communications", "settings")).toBe(false);
  });

  it("religious_ed can access only dashboard, ccd_registrations, ccd_calendar, ccd_permissions, documents", () => {
    const allowed: AdminSection[] = ["dashboard", "ccd_registrations", "ccd_calendar", "ccd_permissions", "documents"];
    for (const section of ALL_SECTIONS) {
      expect(hasAccess("religious_ed", section)).toBe(allowed.includes(section));
    }
  });

  it("youth_ministry can access only dashboard, cyo, teen_life", () => {
    const allowed: AdminSection[] = ["dashboard", "cyo", "teen_life"];
    for (const section of ALL_SECTIONS) {
      expect(hasAccess("youth_ministry", section)).toBe(allowed.includes(section));
    }
  });

  it("sacraments can access only dashboard, sacraments", () => {
    const allowed: AdminSection[] = ["dashboard", "sacraments"];
    for (const section of ALL_SECTIONS) {
      expect(hasAccess("sacraments", section)).toBe(allowed.includes(section));
    }
  });

  it("parish_life can access only dashboard, events, calendar, key_dates, volunteers, registrations", () => {
    const allowed: AdminSection[] = ["dashboard", "events", "calendar", "key_dates", "volunteers", "registrations"];
    for (const section of ALL_SECTIONS) {
      expect(hasAccess("parish_life", section)).toBe(allowed.includes(section));
    }
  });

  it("user (parishioner) has NO admin access", () => {
    for (const section of ALL_SECTIONS) {
      expect(hasAccess("user", section)).toBe(false);
    }
  });

  it("ROLE_PERMISSIONS keys match ALL_ROLES", () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual([...ALL_ROLES].sort());
  });

  it("no role has access to a section not in ALL_SECTIONS", () => {
    for (const role of ALL_ROLES) {
      const perms = ROLE_PERMISSIONS[role];
      for (const section of perms) {
        expect(ALL_SECTIONS).toContain(section);
      }
    }
  });

  // Critical security assertions
  it("only admin can access users section", () => {
    for (const role of ALL_ROLES) {
      if (role === "admin") {
        expect(hasAccess(role, "users")).toBe(true);
      } else {
        expect(hasAccess(role, "users")).toBe(false);
      }
    }
  });

  it("only admin can access settings section", () => {
    for (const role of ALL_ROLES) {
      if (role === "admin") {
        expect(hasAccess(role, "settings")).toBe(true);
      } else {
        expect(hasAccess(role, "settings")).toBe(false);
      }
    }
  });

  it("only admin can access faq section (controls AI assistant knowledge)", () => {
    for (const role of ALL_ROLES) {
      if (role === "admin") {
        expect(hasAccess(role, "faq")).toBe(true);
      } else {
        expect(hasAccess(role, "faq")).toBe(false);
      }
    }
  });
});
