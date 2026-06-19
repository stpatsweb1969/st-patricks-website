/**
 * A5 — Regression guards: "one source stays one source."
 *
 * 1. Schedule-literal guard — fails if a Mass-time-shaped literal appears in
 *    rendered JSX outside the schedule engine and adapters.
 * 2. SEO matches schedule — generateSEODescription contains correct times.
 * 3. Structured-data matches schedule — generateOpeningHours matches first/last Mass per day.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

import {
  DEFAULT_PARISH_SCHEDULE,
  generateSEODescription,
  generateOpeningHours,
  getServicesForDay,
  minutesToTimeString,
  parseTimeToMinutes,
} from "../shared/scheduleEngine";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Recursively collect all .tsx files under a directory. */
function collectTsx(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir.toString(), entry.name);
    if (entry.isDirectory()) results.push(...collectTsx(full));
    else if (entry.name.endsWith(".tsx")) results.push(full);
  }
  return results;
}

// Allowed files that legitimately contain time literals:
const ALLOWED_FILES = [
  "scheduleEngine",
  "scheduleConfig",
  "scheduleData",
  "useParishSchedule",
  "ScheduleManager", // admin editor — default values for new rows
  "KeyDatesManager", // admin placeholder text
  "Contact",         // office hours (not Mass times)
  "FuneralForm",     // office hours display
  "Staff",           // office hours display
  "Ministries",      // devotion/meeting times (not Mass)
  "SacramentProgress", // step description
  "HolyDaysManager",   // admin default mass times for new holy day entries
];

// ─── Test 1: Schedule-literal guard ─────────────────────────────────────────

describe("Schedule-literal guard", () => {
  it("no Mass-time literals in client TSX outside schedule adapters", () => {
    const clientSrc = path.resolve(__dirname, "../client/src");
    const files = collectTsx(clientSrc);
    const timePattern = /\b\d{1,2}:\d{2}\s?(AM|PM)\b/g;
    const violations: string[] = [];

    for (const file of files) {
      const basename = path.basename(file, ".tsx");
      if (ALLOWED_FILES.some(a => basename.includes(a))) continue;

      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip fallback patterns like `|| "8:30 AM"` — these are acceptable
        if (line.includes("||") && timePattern.test(line)) {
          timePattern.lastIndex = 0;
          continue;
        }
        // Skip non-Mass time contexts (office hours, devotions, meeting times)
        if (/office|hours|monday|thursday|friday|devotion|meeting/i.test(line)) continue;
        // Skip comments
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;
        // Skip placeholder text in admin inputs
        if (line.includes("placeholder=")) continue;

        const matches = line.match(timePattern);
        if (matches) {
          violations.push(`${path.relative(clientSrc, file)}:${i + 1} → ${matches.join(", ")}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

// ─── Test 2: SEO matches schedule ───────────────────────────────────────────

describe("SEO matches schedule", () => {
  it("generateSEODescription contains correct Sat vigil + Sunday times", () => {
    const desc = generateSEODescription(DEFAULT_PARISH_SCHEDULE);

    // Must contain the actual Saturday vigil time
    const satMasses = DEFAULT_PARISH_SCHEDULE.services.filter(
      s => s.dayOfWeek === 6 && s.type === "mass"
    );
    const satVigil = satMasses[satMasses.length - 1];
    expect(desc).toContain(satVigil.time.replace(" PM", ""));

    // Must contain Sunday times
    const sunMasses = DEFAULT_PARISH_SCHEDULE.services.filter(
      s => s.dayOfWeek === 0 && s.type === "mass" && !s.seasonal
    );
    for (const m of sunMasses) {
      const shortTime = m.time.replace(" AM", "").replace(" PM", "");
      expect(desc).toContain(shortTime);
    }

    // Must NOT contain the old wrong times
    expect(desc).not.toContain("5:00");
    expect(desc).not.toContain("8:00 AM, 10:00 AM, 12:00 PM");
  });
});

// ─── Test 3: Structured-data matches schedule ───────────────────────────────

describe("Structured-data (openingHours) matches schedule", () => {
  it("generateOpeningHours opens/closes match first/last Mass per day", () => {
    const hours = generateOpeningHours(DEFAULT_PARISH_SCHEDULE);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // For each day that has masses, verify opens = first mass, closes = last mass end
    const massDays = new Set(
      DEFAULT_PARISH_SCHEDULE.services
        .filter(s => s.type === "mass")
        .map(s => s.dayOfWeek)
    );

    for (const dow of massDays) {
      const dayMasses = DEFAULT_PARISH_SCHEDULE.services
        .filter(s => s.dayOfWeek === dow && s.type === "mass")
        .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

      const entry = hours.find(h => h.dayOfWeek === dayNames[dow]);
      expect(entry).toBeDefined();

      if (entry && dayMasses.length > 0) {
        // Opens at first mass (24h format HH:MM)
        const firstMassMin = parseTimeToMinutes(dayMasses[0].time);
        const expectedOpens = `${String(Math.floor(firstMassMin / 60)).padStart(2, "0")}:${String(firstMassMin % 60).padStart(2, "0")}`;
        expect(entry.opens).toBe(expectedOpens);

        // Closes at last mass end (24h format HH:MM)
        const lastMass = dayMasses[dayMasses.length - 1];
        const lastMassEnd = parseTimeToMinutes(lastMass.time) + lastMass.durationMin;
        const expectedCloses = `${String(Math.floor(lastMassEnd / 60)).padStart(2, "0")}:${String(lastMassEnd % 60).padStart(2, "0")}`;
        expect(entry.closes).toBe(expectedCloses);
      }
    }
  });
});
