/**
 * Google Calendar (ICS) Router — parish, CCD, and CYO calendar feeds.
 * ~75 lines
 */
import { publicProcedure, router, db } from "./_helpers";

export const calendarRouter = router({
  parishEvents: publicProcedure.query(async () => {
    const { parseICSFeed, PARISH_CALENDAR_ICS } = await import("../icsParser");
    return parseICSFeed(PARISH_CALENDAR_ICS, { daysAhead: 60, maxEvents: 50 });
  }),
  ccdEvents: publicProcedure.query(async () => {
    const { parseICSFeed, CCD_CALENDAR_ICS } = await import("../icsParser");
    return parseICSFeed(CCD_CALENDAR_ICS, { daysAhead: 120, maxEvents: 50 });
  }),
  cyoEvents: publicProcedure.query(async () => {
    const { parseICSFeed, CYO_CALENDAR_ICS } = await import("../icsParser");
    return parseICSFeed(CYO_CALENDAR_ICS, { daysAhead: 120, maxEvents: 50 });
  }),
  nextEvent: publicProcedure.query(async () => {
    const { parseICSFeed, PARISH_CALENDAR_ICS } = await import("../icsParser");
    const events = await parseICSFeed(PARISH_CALENDAR_ICS, { daysAhead: 14, maxEvents: 20 });
    const nonMass = events.find(e =>
      !e.title.toLowerCase().includes("daily mass") &&
      !e.title.toLowerCase().includes("sunday mass")
    );
    return nonMass || events[0] || null;
  }),
  upcomingEvents: publicProcedure.query(async () => {
    const { parseICSFeed, PARISH_CALENDAR_ICS } = await import("../icsParser");
    const events = await parseICSFeed(PARISH_CALENDAR_ICS, { daysAhead: 14, maxEvents: 20 });
    const filtered = events.filter(e =>
      !e.title.toLowerCase().includes("daily mass")
    );
    return filtered.slice(0, 3);
  }),
  allEvents: publicProcedure.query(async () => {
    const { parseICSFeed, PARISH_CALENDAR_ICS, CCD_CALENDAR_ICS, CYO_CALENDAR_ICS } = await import("../icsParser");
    const [parish, ccd, cyo, dbParish, dbCcd] = await Promise.all([
      parseICSFeed(PARISH_CALENDAR_ICS, { daysAhead: 180, maxEvents: 100 }),
      parseICSFeed(CCD_CALENDAR_ICS, { daysAhead: 180, maxEvents: 100 }),
      parseICSFeed(CYO_CALENDAR_ICS, { daysAhead: 180, maxEvents: 100 }),
      db.getUpcomingEvents(),
      db.getCcdEvents("2026-2027"),
    ]);
    const all = [
      ...parish.map(e => ({ ...e, source: "parish" as const })),
      ...ccd.map(e => ({ ...e, source: "ccd" as const })),
      ...cyo.map(e => ({ ...e, source: "cyo" as const })),
      ...(dbParish || []).map(e => ({
        id: `db-${e.id}`,
        title: e.title,
        description: e.description,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        allDay: e.allDay,
        source: "parish" as const,
      })),
      ...(dbCcd || []).map((e: any) => ({
        id: `ccd-db-${e.id}`,
        title: e.title,
        description: e.description,
        location: e.location,
        startDate: e.eventDate,
        endDate: e.endDate,
        allDay: false,
        source: "ccd" as const,
      })),
    ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return all;
  }),
});
