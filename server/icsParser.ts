import ICAL from "ical.js";

export interface ParsedEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string
  allDay: boolean;
  recurring: boolean;
}

// Cache parsed events for 15 minutes to avoid hammering Google
const cache: Map<string, { events: ParsedEvent[]; fetchedAt: number }> = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch and parse an ICS feed URL, expanding recurring events for the next N days
 */
export async function parseICSFeed(
  icsUrl: string,
  options: { daysAhead?: number; maxEvents?: number } = {}
): Promise<ParsedEvent[]> {
  const { daysAhead = 60, maxEvents = 50 } = options;

  // Check cache (key includes options so different ranges don't share stale data)
  const cacheKey = `${icsUrl}:${daysAhead}:${maxEvents}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.events;
  }

  try {
    const response = await fetch(icsUrl, {
      headers: { "User-Agent": "StPatricksArmonk/1.0" },
    });
    if (!response.ok) {
      console.error(`ICS fetch failed: ${response.status} ${response.statusText}`);
      return cached?.events || [];
    }

    const icsText = await response.text();
    const jcalData = ICAL.parse(icsText);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents("vevent");

    const now = new Date();
    const rangeStart = ICAL.Time.fromJSDate(now);
    const rangeEnd = ICAL.Time.fromJSDate(
      new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    );

    const events: ParsedEvent[] = [];

    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);

      if (event.isRecurring()) {
        // Expand recurring events within range
        const iterator = event.iterator();
        let next = iterator.next();
        let count = 0;

        while (next && count < 100) {
          if (next.compare(rangeEnd) > 0) break;

          if (next.compare(rangeStart) >= 0) {
            const duration = event.duration;
            const endTime = next.clone();
            endTime.addDuration(duration);

            events.push({
              id: `${event.uid}-${next.toJSDate().getTime()}`,
              title: event.summary || "Untitled",
              description: event.description || undefined,
              location: event.location || undefined,
              startDate: next.toJSDate().toISOString(),
              endDate: endTime.toJSDate().toISOString(),
              allDay: next.isDate,
              recurring: true,
            });
          }

          next = iterator.next();
          count++;
        }
      } else {
        // Single event
        const startTime = event.startDate;
        if (!startTime) continue;

        // Only include future events
        if (startTime.compare(rangeStart) < 0) continue;
        if (startTime.compare(rangeEnd) > 0) continue;

        events.push({
          id: event.uid || `single-${startTime.toJSDate().getTime()}`,
          title: event.summary || "Untitled",
          description: event.description || undefined,
          location: event.location || undefined,
          startDate: startTime.toJSDate().toISOString(),
          endDate: event.endDate?.toJSDate().toISOString(),
          allDay: startTime.isDate,
          recurring: false,
        });
      }
    }

    // Sort by start date
    events.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Limit
    const result = events.slice(0, maxEvents);

    // Cache
    cache.set(cacheKey, { events: result, fetchedAt: Date.now() });

    return result;
  } catch (error) {
    console.error("ICS parsing error:", error);
    return cached?.events || [];
  }
}

// Predefined calendar URLs
export const PARISH_CALENDAR_ICS =
  "https://calendar.google.com/calendar/ical/auhh52vq6k97cih05uovakdvlcobb3qj%40import.calendar.google.com/public/basic.ics";

export const CCD_CALENDAR_ICS =
  "https://calendar.google.com/calendar/ical/reled%40stpatrickinarmonk.org/public/basic.ics";

export const CYO_CALENDAR_ICS =
  "https://calendar.google.com/calendar/ical/stpatrickinarmonk.org_5snqr5qqph11et22r6sk81k67g%40group.calendar.google.com/public/basic.ics";
