/**
 * Generate an .ics (iCalendar) file and trigger download.
 * Works entirely client-side — no server needed.
 */

interface ICSEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatDateUTC(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function formatDateLocal(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function escapeICS(str: string): string {
  return str.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

export function generateICS(event: ICSEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@stpatrickarmonk.org`;
  const now = formatDateUTC(new Date());

  let dtStart: string;
  let dtEnd: string;

  if (event.allDay) {
    dtStart = `DTSTART;VALUE=DATE:${formatDateLocal(event.startDate)}`;
    const end = event.endDate || new Date(event.startDate.getTime() + 86400000);
    dtEnd = `DTEND;VALUE=DATE:${formatDateLocal(end)}`;
  } else {
    dtStart = `DTSTART:${formatDateUTC(event.startDate)}`;
    const end = event.endDate || new Date(event.startDate.getTime() + 3600000); // default 1 hour
    dtEnd = `DTEND:${formatDateUTC(end)}`;
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//St. Patrick in Armonk//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeICS(event.title)}`,
  ];

  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`);
  }
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

export function downloadICS(event: ICSEvent): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate .ics for a recurring weekly Mass/service
 */
export function downloadMassICS(options: {
  title: string;
  day: string;
  time: string;
  location?: string;
  durationMin?: number;
}): void {
  // Parse the time string like "8:30 AM" to hours/minutes
  const match = options.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const isPM = match[3].toUpperCase() === "PM";
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  // Find the next occurrence of this day
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
  };
  const targetDay = dayMap[options.day] ?? 0;
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;

  const startDate = new Date(now);
  startDate.setDate(now.getDate() + daysUntil);
  startDate.setHours(hours, minutes, 0, 0);

  const duration = (options.durationMin ?? 60) * 60000;
  const endDate = new Date(startDate.getTime() + duration);

  downloadICS({
    title: options.title,
    startDate,
    endDate,
    location: options.location || "St. Patrick Church, 29 Cox Ave, Armonk NY 10504",
  });
}
