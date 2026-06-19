/**
 * Liturgical Season Awareness
 * 
 * Detects the current liturgical season based on date and returns
 * appropriate accent colors for the UI.
 * 
 * Seasons:
 * - Ordinary Time (green): Most of the year
 * - Advent (purple): ~4 Sundays before Christmas
 * - Christmas (gold/white): Dec 25 – Baptism of the Lord
 * - Lent (purple): Ash Wednesday – Holy Thursday
 * - Easter (gold/white): Easter Sunday – Pentecost
 */

export type LiturgicalSeason = "ordinary" | "advent" | "christmas" | "lent" | "easter";

export interface SeasonTheme {
  season: LiturgicalSeason;
  label: string;
  accentColor: string; // Tailwind class prefix
  accentHex: string;
  bgGradient: string;
  textColor: string;
  badgeClass: string;
}

/** Get Easter Sunday date for a given year using the Anonymous Gregorian algorithm */
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

/** Get the Sunday on or before a given date */
function getSundayOnOrBefore(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/** Determine the current liturgical season */
export function getLiturgicalSeason(date: Date = new Date()): LiturgicalSeason {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  // Easter date for this year
  const easter = getEasterDate(year);

  // Ash Wednesday = Easter - 46 days
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);

  // Pentecost = Easter + 49 days
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  // Advent: 4th Sunday before Christmas (the Sunday on or before Dec 3)
  const dec3 = new Date(year, 11, 3); // Dec 3
  const advent1 = getSundayOnOrBefore(dec3);
  // If Dec 3 is a Sunday, that's the first Sunday of Advent
  // Otherwise it's the Sunday before

  // Christmas season: Dec 25 to Baptism of the Lord (Sunday after Jan 6)
  const christmas = new Date(year, 11, 25); // Dec 25
  const jan6 = new Date(year, 0, 6); // Epiphany
  const baptismOfLord = new Date(jan6);
  // Baptism of the Lord is the Sunday after Epiphany (Jan 6)
  // If Jan 6 is a Sunday, Baptism is the following Sunday
  baptismOfLord.setDate(jan6.getDate() + (7 - jan6.getDay()) % 7);
  if (baptismOfLord.getTime() === jan6.getTime()) {
    baptismOfLord.setDate(baptismOfLord.getDate() + 7);
  }

  const current = new Date(year, month, day);

  // Check Christmas season (spans year boundary)
  if (month === 11 && day >= 25) {
    return "christmas";
  }
  if (current <= baptismOfLord && month <= 1) {
    return "christmas";
  }

  // Check Lent (Ash Wednesday to Holy Thursday = Easter - 3)
  const holyThursday = new Date(easter);
  holyThursday.setDate(easter.getDate() - 3);
  if (current >= ashWednesday && current <= holyThursday) {
    return "lent";
  }

  // Check Easter season (Easter to Pentecost)
  if (current >= easter && current <= pentecost) {
    return "easter";
  }

  // Check Advent
  if (current >= advent1 && month === 11 && day < 25) {
    return "advent";
  }

  // Default: Ordinary Time
  return "ordinary";
}

/** Get the theme configuration for a liturgical season */
export function getSeasonTheme(season?: LiturgicalSeason): SeasonTheme {
  const s = season || getLiturgicalSeason();

  switch (s) {
    case "advent":
      return {
        season: "advent",
        label: "Advent",
        accentColor: "purple",
        accentHex: "#7C3AED",
        bgGradient: "from-purple-50 to-white",
        textColor: "text-purple-700",
        badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
      };
    case "lent":
      return {
        season: "lent",
        label: "Lent",
        accentColor: "purple",
        accentHex: "#6D28D9",
        bgGradient: "from-purple-50 to-white",
        textColor: "text-purple-700",
        badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
      };
    case "christmas":
      return {
        season: "christmas",
        label: "Christmas",
        accentColor: "amber",
        accentHex: "#D97706",
        bgGradient: "from-amber-50 to-white",
        textColor: "text-amber-700",
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case "easter":
      return {
        season: "easter",
        label: "Easter",
        accentColor: "amber",
        accentHex: "#D97706",
        bgGradient: "from-amber-50 to-white",
        textColor: "text-amber-700",
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case "ordinary":
    default:
      return {
        season: "ordinary",
        label: "Ordinary Time",
        accentColor: "emerald",
        accentHex: "#166534",
        bgGradient: "from-emerald-50 to-white",
        textColor: "text-emerald-700",
        badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
  }
}

/** Get a human-readable description of the current liturgical period */
export function getSeasonDescription(season?: LiturgicalSeason): string {
  const s = season || getLiturgicalSeason();
  const now = new Date();
  const weekNum = getOrdinaryTimeWeek(now);

  switch (s) {
    case "advent":
      return "Preparing for the coming of Christ";
    case "lent":
      return "A season of prayer, fasting, and almsgiving";
    case "christmas":
      return "Celebrating the birth of our Savior";
    case "easter":
      return "Rejoicing in the Resurrection";
    case "ordinary":
    default:
      return weekNum ? `Week ${weekNum} in Ordinary Time` : "Ordinary Time";
  }
}

/** Approximate the week number in Ordinary Time */
function getOrdinaryTimeWeek(date: Date): number | null {
  const year = date.getFullYear();
  const easter = getEasterDate(year);
  const jan6 = new Date(year, 0, 6);
  const baptismOfLord = new Date(jan6);
  baptismOfLord.setDate(jan6.getDate() + (7 - jan6.getDay()) % 7);
  if (baptismOfLord.getTime() === jan6.getTime()) {
    baptismOfLord.setDate(baptismOfLord.getDate() + 7);
  }

  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  const current = new Date(year, date.getMonth(), date.getDate());

  // First period of Ordinary Time: after Baptism of Lord to Ash Wednesday
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);

  if (current > baptismOfLord && current < ashWednesday) {
    const diffDays = Math.floor((current.getTime() - baptismOfLord.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  }

  // Second period: after Pentecost to Advent
  if (current > pentecost) {
    const diffDays = Math.floor((current.getTime() - pentecost.getTime()) / (1000 * 60 * 60 * 24));
    // Ordinary Time resumes around week 9-10 after Pentecost
    return Math.floor(diffDays / 7) + 9;
  }

  return null;
}
