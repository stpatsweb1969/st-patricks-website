/**
 * Parish Assistant Router — AI chatbot that answers common parish questions.
 * Uses the built-in LLM with parish context + live ICS calendar events.
 * ~140 lines
 */
import { publicProcedure, router, z, db } from "./_helpers";
import { rateLimitedChatProcedure } from "./_rateLimited";
import { invokeLLM } from "../_core/llm";
import { DEFAULT_PARISH_SCHEDULE, DEFAULT_PARISH_INFO, parseTimeToMinutes, minutesToTimeString } from "../../shared/scheduleEngine";
import type { ParishSchedule, ParishInfo } from "../../shared/scheduleEngine";
import { generateSacramentPoliciesSummary } from "../../shared/sacramentPolicies";

const SCHEDULE_KEY = "parish_schedule";
const INFO_KEY = "parish_info";

/** Read the LIVE admin-edited schedule, falling back to defaults only if unset. */
async function getLiveSchedule(): Promise<ParishSchedule> {
  const raw = await db.getSiteSetting(SCHEDULE_KEY);
  if (!raw) return DEFAULT_PARISH_SCHEDULE;
  try { return JSON.parse(raw) as ParishSchedule; } catch { return DEFAULT_PARISH_SCHEDULE; }
}

async function getLiveInfo(): Promise<ParishInfo> {
  const raw = await db.getSiteSetting(INFO_KEY);
  if (!raw) return DEFAULT_PARISH_INFO;
  try { return JSON.parse(raw) as ParishInfo; } catch { return DEFAULT_PARISH_INFO; }
}

/**
 * Build the schedule portion of the system prompt from the LIVE admin schedule.
 */
async function buildScheduleContext(): Promise<string> {
  const s = await getLiveSchedule();
  const info = await getLiveInfo();
  const lines: string[] = [];
  lines.push(`- Location: ${info.address}, ${info.city}, ${info.state} ${info.zip}`);
  lines.push(`- Phone: ${info.phone}`);
  lines.push(`- Pastor: ${info.pastorName}`);

  // Weekend Masses
  const satVigil = s.services.find(svc => svc.dayOfWeek === 6 && svc.type === "mass");
  const sunMasses = s.services.filter(svc => svc.dayOfWeek === 0 && svc.type === "mass");
  const sunTimes = sunMasses.map(m => {
    let t = m.time;
    if (m.seasonal) t += ` (${m.seasonal.note})`;
    return t;
  }).join(", ");
  lines.push(`- Weekend Masses: Saturday Vigil ${satVigil?.time || "5:30 PM"}, Sunday ${sunTimes}`);

  // Weekday Mass
  const weekdayMass = s.services.find(svc => svc.dayOfWeek >= 2 && svc.dayOfWeek <= 5 && svc.type === "mass");
  if (weekdayMass) lines.push(`- Weekday Mass: Tuesday\u2013Friday ${weekdayMass.time} (no Monday Mass)`);

  // Rosary
  const rosary = s.services.find(svc => svc.name === "Rosary");
  if (rosary) lines.push(`- Rosary: Thursdays ${rosary.time}`);

  // First Friday Adoration
  const adoration = s.services.find(svc => svc.type === "adoration");
  if (adoration) lines.push(`- First Friday Adoration: Exposition of the Blessed Sacrament, 9 AM – 7 PM (Sept–June)`);

  // Confession
  const confession = s.services.find(svc => svc.type === "confession");
  if (confession) {
    const endMin = parseTimeToMinutes(confession.time) + confession.durationMin;
    const endTime = minutesToTimeString(endMin);
    lines.push(`- Confessions: Saturday ${confession.time}\u2013${endTime.split(" ")[0]} ${endTime.split(" ")[1]} or by appointment`);
  }

  lines.push(`- Parish Office Hours: ${info.officeHours}`);
  return lines.join("\n");
}

/** Fetch today's readings + saint for dynamic context. */
async function buildReadingsContext(): Promise<string> {
  let ctx = "";
  try {
    const { getDailyReadings } = await import("../dailyReadings");
    const readings = await getDailyReadings();
    if (readings) {
      ctx += `\n\nTODAY'S READINGS (${readings.liturgicTitle || readings.date}):\n`;
      ctx += `- First Reading: ${readings.firstReading?.title || "N/A"}\n`;
      if (readings.secondReading) ctx += `- Second Reading: ${readings.secondReading.title}\n`;
      ctx += `- Responsorial Psalm: ${readings.psalm?.title || "N/A"}\n`;
      ctx += `- Gospel: ${readings.gospel?.title || "N/A"}\n`;
    }
  } catch (e) { console.error("[Assistant] Failed to load daily readings:", e); }
  try {
    const { getSaintOfDay } = await import("../saintOfDay");
    const saint = await getSaintOfDay();
    if (saint?.featuredSaint?.name) {
      ctx += `\nSAINT OF THE DAY: ${saint.featuredSaint.name}`;
      if (saint.featuredSaint.biography) ctx += ` — ${saint.featuredSaint.biography.substring(0, 200)}...`;
      ctx += "\n";
    } else if (saint?.saints && saint.saints.length > 0) {
      ctx += `\nSAINT(S) OF THE DAY: ${saint.saints.join(", ")}\n`;
    }
  } catch (e) { console.error("[Assistant] Failed to load saint of day:", e); }
  return ctx;
}

const STATIC_CONTEXT_HEADER = `You are the AI Parish Assistant for St. Patrick Church in Armonk, New York.
You help parishioners and visitors with questions about the parish.

PROGRAMS:
- CCD (Religious Education): Classes for grades 1-8, registration required
- Teen Life: Youth ministry for high school students (meets in St. Francis Hall)
- CYO Basketball: Grades 3-8, November–March, St. Francis Hall
- RCIA: Rite of Christian Initiation of Adults

SACRAMENTS:
${generateSacramentPoliciesSummary()}

GUIDELINES:
- Be warm, welcoming, and helpful
- If you have calendar event data below, USE IT to answer questions about upcoming events
- Keep answers concise but informative
- Never make up information about specific people, dates, or events you don't have data for
- You can reference the bulletin, events calendar, and news sections of the website
- If unsure, direct them to call the parish office at (914) 273-9724`;

export const parishAssistantRouter = router({
  /** Chat with the AI Parish Assistant */
  chat: rateLimitedChatProcedure.input(z.object({
    message: z.string().min(1).max(2000),
    history: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })).max(20).default([]),
  })).mutation(async ({ input }) => {
    let dynamicContext = "";

    try {
      // Fetch ICS calendar events (the same data that powers the calendar page)
      const { parseICSFeed, PARISH_CALENDAR_ICS, CCD_CALENDAR_ICS, CYO_CALENDAR_ICS } = await import("../icsParser");
      const [parishIcs, ccdIcs, cyoIcs] = await Promise.all([
        parseICSFeed(PARISH_CALENDAR_ICS, { daysAhead: 90, maxEvents: 40 }),
        parseICSFeed(CCD_CALENDAR_ICS, { daysAhead: 90, maxEvents: 20 }),
        parseICSFeed(CYO_CALENDAR_ICS, { daysAhead: 90, maxEvents: 20 }),
      ]);

      const allCalEvents = [
        ...parishIcs.map(e => ({ ...e, source: "Parish" })),
        ...ccdIcs.map(e => ({ ...e, source: "CCD" })),
        ...cyoIcs.map(e => ({ ...e, source: "CYO" })),
      ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      if (allCalEvents.length > 0) {
        dynamicContext += "\n\nUPCOMING CALENDAR EVENTS (from Google Calendar feeds):\n";
        for (const e of allCalEvents.slice(0, 40)) {
          const dateStr = new Date(e.startDate).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          });
          const timeStr = e.allDay ? "All Day" : new Date(e.startDate).toLocaleTimeString("en-US", {
            hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
          });
          dynamicContext += `- [${e.source}] ${e.title} — ${dateStr}, ${timeStr}${e.location ? ` @ ${e.location}` : ""}\n`;
        }
      }

      // Inject FAQ knowledge base
      const faqs = await db.getActiveFaqs();
      if (faqs.length > 0) {
        dynamicContext += "\n\nFAQ KNOWLEDGE BASE (use these to answer common questions):\n";
        for (const faq of faqs) {
          dynamicContext += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
        }
      }

      // Include ALL Key Dates (important_dates table - includes Bag Bingo, Confirmation, etc.)
      // Use getAllPublishedImportantDates to get everything, then filter to future only
      const allKeyDates = await db.getAllPublishedImportantDates();
      const now = new Date();
      const keyDates = allKeyDates.filter(kd => new Date(kd.eventDate) >= now);
      if (keyDates.length > 0) {
        dynamicContext += "\n\nKEY DATES & SPECIAL EVENTS (from parish database):\n";
        for (const kd of keyDates) {
          const dateStr = new Date(kd.eventDate).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric", year: "numeric",
          });
          dynamicContext += `- [${kd.category}] ${kd.title} — ${dateStr}${kd.location ? ` @ ${kd.location}` : ""}${kd.note ? ` (${kd.note})` : ""}\n`;
        }
      }

      // Also include DB events and news
      const upcomingEvents = await db.getUpcomingEvents(5);
      if (upcomingEvents.length > 0) {
        dynamicContext += "\n\nDB PARISH EVENTS:\n";
        for (const e of upcomingEvents) {
          const dateStr = new Date(e.startDate).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          });
          dynamicContext += `- ${e.title} — ${dateStr}${e.location ? ` @ ${e.location}` : ""}\n`;
        }
      }

      const recentNews = await db.getPublishedNewsPosts(3);
      if (recentNews.length > 0) {
        dynamicContext += "\n\nRECENT NEWS:\n";
        for (const n of recentNews) {
          dynamicContext += `- ${n.title}: ${n.excerpt || n.content?.substring(0, 80) || ""}\n`;
        }
      }

      // Closure alert status (live)
      const closureRaw = await db.getSiteSetting("closure_alert");
      if (closureRaw) {
        try {
          const closure = JSON.parse(closureRaw);
          if (closure.active) {
            dynamicContext += `\n\n⚠️ ACTIVE CLOSURE ALERT: ${closure.title} — ${closure.message}\n`;
            dynamicContext += `(Activated ${new Date(closure.activatedAt).toLocaleString("en-US", { timeZone: "America/New_York" })})\n`;
          }
        } catch (e) { console.error("[Assistant] Failed to parse closure alert:", e); }
      }

      // Latest bulletin
      const bulletins = (await db.getPublishedBulletins()).slice(0, 1);
      if (bulletins.length > 0) {
        const b = bulletins[0];
        dynamicContext += `\n\nLATEST BULLETIN: "${b.title}" published ${new Date(b.publishedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Available at /bulletins on the website.\n`;
      }

      // Upcoming Holy Days (from admin-managed DB)
      const upcomingHolyDays = await db.getUpcomingHolyDays(10);
      if (upcomingHolyDays.length > 0) {
        dynamicContext += "\n\nUPCOMING HOLY DAYS & SPECIAL MASSES:\n";
        for (const hd of upcomingHolyDays) {
          const [y, m, d] = hd.date.split("-").map(Number);
          const dateStr = new Date(y, m - 1, d).toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric", year: "numeric",
          });
          const times = (hd.massTimes as string[]).join(", ");
          dynamicContext += `- ${hd.name} (${hd.category}) — ${dateStr}, Mass at ${times}${hd.notes ? ` (${hd.notes})` : ""}\n`;
        }
      }

      // Active volunteer needs
      const volunteerNeeds = await db.getActiveVolunteerNeeds();
      if (volunteerNeeds.length > 0) {
        dynamicContext += "\n\nCURRENT VOLUNTEER NEEDS:\n";
        for (const v of volunteerNeeds.slice(0, 5)) {
          dynamicContext += `- ${v.title}${v.urgency === "high" ? " (URGENT)" : ""}\n`;
        }
      }
    } catch (err) {
      console.error("[Parish Assistant] Context fetch error:", err);
    }

    // Build the LIVE schedule context (reads from admin-edited DB, not hardcoded defaults)
    const scheduleCtx = await buildScheduleContext();
    const readingsCtx = await buildReadingsContext();
    const systemPrompt = STATIC_CONTEXT_HEADER + `\n\nKEY INFORMATION (LIVE from admin schedule):\n${scheduleCtx}` + dynamicContext + readingsCtx;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...input.history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user", content: input.message },
    ];

    try {
      const result = await invokeLLM({
        messages,
        maxTokens: 500,
      });

      const reply = result.choices[0]?.message?.content;
      const text = typeof reply === "string" ? reply : Array.isArray(reply) ? reply.map(p => "text" in p ? p.text : "").join("") : "I'm sorry, I couldn't generate a response. Please try again.";

      return { reply: text };
    } catch (error: any) {
      console.error("[Parish Assistant] LLM error:", error);
      return {
        reply: "I'm sorry, I'm having trouble right now. Please call the parish office at (914) 273-9724 for assistance.",
      };
    }
  }),
});
