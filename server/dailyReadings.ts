/**
 * Daily Readings from Evangelizo.org
 * Fetches the daily Mass readings (First Reading, Psalm, Gospel) with caching.
 */

interface DailyReadingsData {
  date: string;
  liturgicTitle: string;
  firstReading: { title: string; text: string };
  psalm: { title: string; text: string };
  gospel: { title: string; text: string };
  secondReading?: { title: string; text: string };
}

let cache: { data: DailyReadingsData; fetchedAt: number; dateKey: string } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getTodayDateString(): string {
  // Use Eastern Time for the date
  const now = new Date();
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const year = eastern.getFullYear();
  const month = String(eastern.getMonth() + 1).padStart(2, "0");
  const day = String(eastern.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function cleanBodyText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/?p[^>]*>/gi, "\n")
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchReading(date: string, type: string, content?: string): Promise<string> {
  const params = new URLSearchParams({ date, type, lang: "AM" });
  if (content) params.set("content", content);
  const url = `https://feed.evangelizo.org/v2/reader.php?${params.toString()}`;
  
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return "";
    const text = await response.text();
    return text.trim();
  } catch {
    return "";
  }
}

export async function getDailyReadings(): Promise<DailyReadingsData | null> {
  const today = getTodayDateString();
  
  // Return cached data if still valid and for today
  if (cache && cache.dateKey === today && Date.now() - cache.fetchedAt < CACHE_DURATION) {
    return cache.data;
  }

  try {
    const [liturgicTitle, frTitle, frText, psTitle, psText, gspTitle, gspText, srTitle, srText] = await Promise.all([
      fetchReading(today, "liturgic_t"),
      fetchReading(today, "reading_lt", "FR"),
      fetchReading(today, "reading", "FR"),
      fetchReading(today, "reading_lt", "PS"),
      fetchReading(today, "reading", "PS"),
      fetchReading(today, "reading_lt", "GSP"),
      fetchReading(today, "reading", "GSP"),
      fetchReading(today, "reading_lt", "SR"),
      fetchReading(today, "reading", "SR"),
    ]);

    const data: DailyReadingsData = {
      date: today,
      liturgicTitle: stripHtmlTags(liturgicTitle) || "Daily Readings",
      firstReading: { title: stripHtmlTags(frTitle) || "First Reading", text: cleanBodyText(frText) },
      psalm: { title: stripHtmlTags(psTitle) || "Responsorial Psalm", text: cleanBodyText(psText) },
      gospel: { title: stripHtmlTags(gspTitle) || "Gospel", text: cleanBodyText(gspText) },
    };

    if (srText) {
      data.secondReading = { title: stripHtmlTags(srTitle) || "Second Reading", text: cleanBodyText(srText) };
    }

    cache = { data, fetchedAt: Date.now(), dateKey: today };
    return data;
  } catch (error) {
    console.error("Failed to fetch daily readings:", error);
    return cache?.data || null;
  }
}

interface SundayReadingsData {
  date: string;
  dateFormatted: string; // e.g., "June 21, 2026"
  liturgicTitle: string;
  firstReading: { title: string };
  psalm: { title: string };
  secondReading?: { title: string };
  gospel: { title: string };
  daysUntil: number;
}

let sundayCache: { data: SundayReadingsData; fetchedAt: number; dateKey: string } | null = null;

function getNextSundayDateString(): { dateStr: string; daysUntil: number; formatted: string } {
  const now = new Date();
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const dayOfWeek = eastern.getDay(); // 0=Sun
  
  // If today is Sunday, use today; otherwise find next Sunday
  let daysUntil = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  
  const sunday = new Date(eastern);
  sunday.setDate(sunday.getDate() + daysUntil);
  
  const year = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, "0");
  const day = String(sunday.getDate()).padStart(2, "0");
  
  const formatted = sunday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  
  return { dateStr: `${year}${month}${day}`, daysUntil, formatted };
}

export async function getSundayReadings(): Promise<SundayReadingsData | null> {
  const { dateStr, daysUntil, formatted } = getNextSundayDateString();
  
  // Return cached data if still valid and for the same Sunday
  if (sundayCache && sundayCache.dateKey === dateStr && Date.now() - sundayCache.fetchedAt < CACHE_DURATION) {
    // Update daysUntil in case it changed
    return { ...sundayCache.data, daysUntil };
  }

  try {
    const [liturgicTitle, frTitle, psTitle, gspTitle, srTitle] = await Promise.all([
      fetchReading(dateStr, "liturgic_t"),
      fetchReading(dateStr, "reading_lt", "FR"),
      fetchReading(dateStr, "reading_lt", "PS"),
      fetchReading(dateStr, "reading_lt", "GSP"),
      fetchReading(dateStr, "reading_lt", "SR"),
    ]);

    const data: SundayReadingsData = {
      date: dateStr,
      dateFormatted: formatted,
      liturgicTitle: stripHtmlTags(liturgicTitle) || "Sunday Mass",
      firstReading: { title: stripHtmlTags(frTitle) || "First Reading" },
      psalm: { title: stripHtmlTags(psTitle) || "Responsorial Psalm" },
      gospel: { title: stripHtmlTags(gspTitle) || "Gospel" },
      daysUntil,
    };

    if (srTitle) {
      data.secondReading = { title: stripHtmlTags(srTitle) || "Second Reading" };
    }

    sundayCache = { data, fetchedAt: Date.now(), dateKey: dateStr };
    return data;
  } catch (error) {
    console.error("Failed to fetch Sunday readings:", error);
    return sundayCache?.data ? { ...sundayCache.data, daysUntil } : null;
  }
}
