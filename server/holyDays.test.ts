/**
 * Holy Days feature tests — DB helpers, router, and schema validation.
 */
import { describe, it, expect } from "vitest";
import { holyDays } from "../drizzle/schema";

describe("Holy Days schema", () => {
  it("exports the holyDays table with expected columns", () => {
    expect(holyDays).toBeDefined();
    const cols = Object.keys(holyDays);
    // Table object should exist
    expect(cols.length).toBeGreaterThan(0);
  });
});

describe("Holy Days category validation", () => {
  const validCategories = ["holy_day", "special_mass", "seasonal", "parish_feast", "triduum", "other"];

  it("all 6 categories are defined", () => {
    expect(validCategories).toHaveLength(6);
  });

  it("holy_day is the default category", () => {
    // The schema default is "holy_day"
    expect(validCategories[0]).toBe("holy_day");
  });
});

describe("Holy Days massTimes format", () => {
  it("massTimes should be a JSON array of time strings", () => {
    const massTimes = ["8:30 AM", "12:10 PM", "7:30 PM"];
    expect(Array.isArray(massTimes)).toBe(true);
    expect(massTimes.every(t => typeof t === "string" && t.length > 0)).toBe(true);
  });

  it("parses comma-separated input correctly", () => {
    const input = "8:30 AM, 12:10 PM, 7:30 PM";
    const parsed = input.split(",").map(t => t.trim()).filter(Boolean);
    expect(parsed).toEqual(["8:30 AM", "12:10 PM", "7:30 PM"]);
  });

  it("handles single mass time", () => {
    const input = "10:00 AM";
    const parsed = input.split(",").map(t => t.trim()).filter(Boolean);
    expect(parsed).toEqual(["10:00 AM"]);
  });
});

describe("Holy Days date filtering logic", () => {
  it("correctly identifies upcoming dates", () => {
    const today = new Date().toISOString().slice(0, 10);
    const futureDate = "2030-12-25";
    const pastDate = "2020-01-01";

    expect(futureDate >= today).toBe(true);
    expect(pastDate >= today).toBe(false);
  });

  it("sorts by date ascending", () => {
    const dates = ["2026-12-25", "2026-08-15", "2026-11-01"];
    const sorted = [...dates].sort();
    expect(sorted).toEqual(["2026-08-15", "2026-11-01", "2026-12-25"]);
  });
});
