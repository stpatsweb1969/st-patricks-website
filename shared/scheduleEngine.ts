/**
 * Schedule Engine — Single Source of Truth
 * 
 * This module is the ONE place that defines the parish schedule data shape,
 * parsing logic, countdown calculations, and service-in-progress detection.
 * 
 * All consumers (Hero, ThisWeek, NowBar, MassTimes, NewHere, SEO, .ics) 
 * import from here. No hardcoded Mass times anywhere else.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type ServiceType = "mass" | "confession" | "prayer" | "adoration";

export interface ScheduledService {
  type: ServiceType;
  name: string;           // "Vigil Mass", "Rosary", "First Friday Adoration", etc.
  dayOfWeek: number;      // 0=Sun, 1=Mon, ..., 6=Sat
  time: string;           // "5:30 PM"
  durationMin: number;    // for in-progress detection + .ics end time
  seasonal?: {
    months: number[];     // 1-indexed months when active (e.g., [10,11,12,1,2,3,4,5,6] for Oct–Jun)
    note: string;         // e.g. "1st weekend in July through Labor Day: no 12:30 PM Mass"
  };
  firstOfMonth?: boolean; // If true, only active on the first occurrence of dayOfWeek in the month
  note?: string;          // any additional note
}

export interface HolyDay {
  month: number;          // 1-indexed
  day: number;
  name: string;
  massTimes: string[];    // e.g. ["8:30 AM", "12:10 PM", "7:30 PM"]
}

export interface ParishSchedule {
  services: ScheduledService[];
  holyDays: HolyDay[];
}

export interface ParishInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  officeEmail: string;
  officeHours: string;
  pastorName: string;
  pastorEmail: string;
  flocknoteUrl: string;
  youtubeUrl: string;
  youtubeChannelId: string;
  mapCoordinates: { lat: number; lng: number };
}

// ─── Default Schedule (seed data — the single canonical copy) ────────────────

export const DEFAULT_PARISH_SCHEDULE: ParishSchedule = {
  services: [
    // Sunday
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "8:30 AM", durationMin: 60 },
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "10:30 AM", durationMin: 60 },
    { type: "mass", name: "Mass", dayOfWeek: 0, time: "12:30 PM", durationMin: 60, seasonal: { months: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6], note: "No 12:30 PM Mass from 1st Sunday in July through Labor Day weekend (resumes mid-September)" } },
    // Monday — no services
    // Tuesday
    { type: "mass", name: "Mass", dayOfWeek: 2, time: "8:30 AM", durationMin: 30 },
    // Wednesday
    { type: "mass", name: "Mass", dayOfWeek: 3, time: "8:30 AM", durationMin: 30 },
    // Thursday
    { type: "mass", name: "Mass", dayOfWeek: 4, time: "8:30 AM", durationMin: 30 },
    { type: "prayer", name: "Rosary", dayOfWeek: 4, time: "7:30 PM", durationMin: 30 },
    // Friday
    { type: "mass", name: "Mass", dayOfWeek: 5, time: "8:30 AM", durationMin: 30 },
    { type: "adoration", name: "First Friday Adoration", dayOfWeek: 5, time: "9:00 AM", durationMin: 600, seasonal: { months: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6], note: "First Fridays, Sept–June, 9 AM – 7 PM" }, firstOfMonth: true, note: "Exposition of the Blessed Sacrament" },
    // Saturday
    { type: "confession", name: "Confession", dayOfWeek: 6, time: "4:30 PM", durationMin: 45 },
    { type: "mass", name: "Vigil Mass", dayOfWeek: 6, time: "5:30 PM", durationMin: 60 },
  ],
  holyDays: [
    { month: 1, day: 1, name: "Solemnity of Mary, Mother of God", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 8, day: 15, name: "Assumption of the Blessed Virgin Mary", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 11, day: 1, name: "All Saints' Day", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 12, day: 8, name: "Immaculate Conception", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
    { month: 12, day: 25, name: "Christmas", massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"] },
  ],
};

export const DEFAULT_PARISH_INFO: ParishInfo = {
  name: "St. Patrick in Armonk",
  address: "29 Cox Avenue",
  city: "Armonk",
  state: "NY",
  zip: "10504",
  phone: "(914) 273-9724",
  officeEmail: "office@stpatrickinarmonk.org",
  officeHours: "Mon–Thu 9:00 AM – 5:00 PM",
  pastorName: "Fr. Thadeus Aravindathu",
  pastorEmail: "fr.thadeus@stpatrickinarmonk.org",
  flocknoteUrl: "https://stpatarmonk.flocknote.com/home",
  youtubeUrl: "https://www.youtube.com/@StPatricksArmonk",
  youtubeChannelId: "UCVAmgwg8dltHe98xw95ZsKw",
  mapCoordinates: { lat: 41.1264, lng: -73.7137 },
};

// ─── Utility Functions ───────────────────────────────────────────────────────

export const TIMEZONE = "America/New_York";
export const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

/**
 * Parse a time string like "5:30 PM" into minutes since midnight.
 */
export function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight back to "H:MM AM/PM" string.
 */
export function minutesToTimeString(totalMinutes: number): string {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Check if a service is active in the current month (respects seasonal restrictions).
 */
export function isServiceActiveInMonth(service: ScheduledService, month: number): boolean {
  if (!service.seasonal) return true;
  return service.seasonal.months.includes(month);
}

/**
 * Check if a specific date is the first occurrence of its weekday in its month.
 * e.g., is this Friday the "first Friday" of the month?
 */
export function isFirstOccurrenceInMonth(date: Date): boolean {
  return date.getDate() <= 7;
}

/**
 * Date-aware service filter: checks both seasonal months AND firstOfMonth constraint.
 * Use this when you have the actual date (not just the day-of-week).
 */
export function isServiceActiveOnDate(service: ScheduledService, date: Date): boolean {
  const month = date.getMonth() + 1;
  if (service.seasonal && !service.seasonal.months.includes(month)) return false;
  if (service.firstOfMonth && !isFirstOccurrenceInMonth(date)) return false;
  return true;
}

/**
 * Get services for a specific date (date-aware: respects firstOfMonth).
 */
export function getServicesForDate(schedule: ParishSchedule, date: Date): ScheduledService[] {
  const dayOfWeek = date.getDay();
  return schedule.services
    .filter(s => s.dayOfWeek === dayOfWeek && isServiceActiveOnDate(s, date))
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
}

/**
 * Get services for a specific day of the week, filtered by current month.
 */
export function getServicesForDay(schedule: ParishSchedule, dayOfWeek: number, month: number): ScheduledService[] {
  return schedule.services
    .filter(s => s.dayOfWeek === dayOfWeek && isServiceActiveInMonth(s, month))
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
}

/**
 * Get the full weekly schedule grouped by day, filtered by current month.
 */
export function getWeeklySchedule(schedule: ParishSchedule, month: number): Record<number, ScheduledService[]> {
  const result: Record<number, ScheduledService[]> = {};
  for (let day = 0; day <= 6; day++) {
    result[day] = getServicesForDay(schedule, day, month);
  }
  return result;
}

/**
 * Calculate countdown string from current time to a target service.
 * Returns empty string if service is in the past or more than 24h away.
 */
export function getCountdown(serviceMinutes: number, currentMinutes: number, daysAhead: number = 0): string {
  let totalMinutes = serviceMinutes - currentMinutes + daysAhead * 1440;
  if (totalMinutes <= 0) return "";
  if (totalMinutes > 1440) return "";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `in ${m}m`;
  if (m === 0) return `in ${h}h`;
  return `in ${h}h ${m}m`;
}

/**
 * Check if a service is currently in progress.
 */
export function isServiceInProgress(service: ScheduledService, currentMinutes: number): boolean {
  const startMinutes = parseTimeToMinutes(service.time);
  return currentMinutes >= startMinutes && currentMinutes < startMinutes + service.durationMin;
}

/**
 * Find the next upcoming service from now (across today and tomorrow).
 * Uses date-aware filtering to respect firstOfMonth constraints.
 */
export function getNextService(schedule: ParishSchedule, now: Date): { service: ScheduledService; daysAhead: number; countdown: string } | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Check today's remaining services
  const todayServices = getServicesForDate(schedule, now);
  for (const service of todayServices) {
    const serviceMin = parseTimeToMinutes(service.time);
    if (serviceMin > currentMinutes) {
      return { service, daysAhead: 0, countdown: getCountdown(serviceMin, currentMinutes, 0) };
    }
  }

  // Check next 7 days
  for (let ahead = 1; ahead <= 7; ahead++) {
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + ahead);
    const services = getServicesForDate(schedule, futureDate);
    if (services.length > 0) {
      const service = services[0];
      const serviceMin = parseTimeToMinutes(service.time);
      return { service, daysAhead: ahead, countdown: getCountdown(serviceMin, currentMinutes, ahead) };
    }
  }

  return null;
}

/**
 * Get upcoming Holy Days within the next N days.
 */
export function getUpcomingHolyDays(schedule: ParishSchedule, now: Date, withinDays: number = 7): { name: string; date: Date; massTimes: string[]; daysUntil: number }[] {
  const year = now.getFullYear();
  const today = new Date(year, now.getMonth(), now.getDate());
  const upcoming: { name: string; date: Date; massTimes: string[]; daysUntil: number }[] = [];

  for (const hd of schedule.holyDays) {
    const hdDate = new Date(year, hd.month - 1, hd.day);
    const diffMs = hdDate.getTime() - today.getTime();
    const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0 && daysUntil <= withinDays) {
      upcoming.push({ name: hd.name, date: hdDate, massTimes: hd.massTimes, daysUntil });
    }
  }

  // Also check Ascension (Easter + 39 days)
  const easter = getEasterDate(year);
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);
  const ascDiffMs = ascension.getTime() - today.getTime();
  const ascDaysUntil = Math.round(ascDiffMs / (1000 * 60 * 60 * 24));
  if (ascDaysUntil >= 0 && ascDaysUntil <= withinDays) {
    upcoming.push({ name: "Ascension of the Lord", date: ascension, massTimes: ["8:30 AM", "12:10 PM", "7:30 PM"], daysUntil: ascDaysUntil });
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Generate SEO description from schedule (never hardcoded).
 */
export function generateSEODescription(schedule: ParishSchedule): string {
  const satVigil = schedule.services.find(s => s.dayOfWeek === 6 && s.type === "mass");
  const sunMasses = schedule.services.filter(s => s.dayOfWeek === 0 && s.type === "mass");
  const weekdayMass = schedule.services.find(s => s.dayOfWeek >= 2 && s.dayOfWeek <= 5 && s.type === "mass");
  const confession = schedule.services.find(s => s.type === "confession");

  const parts: string[] = [];
  if (satVigil) parts.push(`Saturday Vigil ${satVigil.time}`);
  if (sunMasses.length > 0) {
    const times = sunMasses.map(s => {
      const t = s.time.replace(" AM", "").replace(" PM", "");
      return s.seasonal ? `${t}*` : t;
    }).join(", ");
    parts.push(`Sunday ${times}`);
  }
  if (weekdayMass) parts.push(`Weekday Tue–Fri ${weekdayMass.time}`);
  if (confession) {
    const endMin = parseTimeToMinutes(confession.time) + confession.durationMin;
    parts.push(`Confessions Saturday ${confession.time.replace(" PM", "")}–${minutesToTimeString(endMin).replace(" PM", "")} PM`);
  }

  return `Mass schedule at St. Patrick Church, Armonk NY. ${parts.join(". ")}.`;
}

/**
 * Generate structured data opening hours from schedule.
 */
export function generateOpeningHours(schedule: ParishSchedule): { dayOfWeek: string; opens: string; closes: string }[] {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hours: { dayOfWeek: string; opens: string; closes: string }[] = [];

  for (let day = 0; day <= 6; day++) {
    const services = schedule.services.filter(s => s.dayOfWeek === day && s.type === "mass");
    if (services.length === 0) continue;

    const firstStart = parseTimeToMinutes(services[0].time);
    const lastService = services[services.length - 1];
    const lastEnd = parseTimeToMinutes(lastService.time) + lastService.durationMin;

    hours.push({
      dayOfWeek: dayNames[day],
      opens: `${String(Math.floor(firstStart / 60)).padStart(2, "0")}:${String(firstStart % 60).padStart(2, "0")}`,
      closes: `${String(Math.floor(lastEnd / 60)).padStart(2, "0")}:${String(lastEnd % 60).padStart(2, "0")}`,
    });
  }

  return hours;
}

// ─── Easter calculation (Anonymous Gregorian algorithm) ──────────────────────

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}
