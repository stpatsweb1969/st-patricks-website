/**
 * Coming Up Filtered — Filterable list of upcoming key dates with weather and countdown.
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Clock, CalendarPlus } from "lucide-react";
import { WeatherBadge, ParkingAdvisory } from "@/components/WeatherBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { downloadICS } from "@/lib/icsGenerator";
import { toast } from "sonner";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { TZDate } from "@date-fns/tz";

const TIMEZONE = "America/New_York";
function toEastern(isoString: string): Date {
  return new TZDate(isoString, TIMEZONE);
}

function getCountdown(eventDate: Date): string {
  const now = new Date();
  const days = differenceInDays(eventDate, now);
  if (days === 0) {
    const hours = differenceInHours(eventDate, now);
    if (hours <= 0) return "Now";
    return `in ${hours}h`;
  }
  if (days === 1) return "Tomorrow";
  if (days < 7) return `in ${days} days`;
  if (days < 14) return "Next week";
  return `in ${Math.ceil(days / 7)} weeks`;
}

const CATEGORIES = [
  { key: "all", label: "All", color: "bg-muted text-foreground" },
  { key: "parish", label: "Parish", color: "bg-primary/15 text-primary" },
  { key: "ccd", label: "CCD", color: "bg-green-500/15 text-green-700" },
  { key: "cyo", label: "CYO", color: "bg-orange-500/15 text-orange-700" },
  { key: "sacrament", label: "Sacrament", color: "bg-purple-500/15 text-purple-700" },
];

interface ComingUpFilteredProps {
  events: any[];
  catColors: Record<string, { dot: string; bg: string }>;
}

export function ComingUpFiltered({ events, catColors }: ComingUpFilteredProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return events;
    if (activeFilter === "parish") return events.filter((e) => e.category === "parish" || e.category === "teen_life" || e.category === "social");
    return events.filter((e) => e.category === activeFilter);
  }, [events, activeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: events.length };
    events.forEach((e) => {
      if (e.category === "teen_life" || e.category === "social") {
        c["parish"] = (c["parish"] || 0) + 1;
      } else {
        c[e.category] = (c[e.category] || 0) + 1;
      }
    });
    return c;
  }, [events]);

  const weatherInput = useMemo(() => {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return events
      .filter(e => {
        const d = new Date(e.eventDate as unknown as string);
        return d >= now && d <= sevenDays;
      })
      .map(e => ({
        id: e.id?.toString() || e.title,
        title: e.title,
        description: e.note || undefined,
        location: e.location || undefined,
        startDate: new Date(e.eventDate as unknown as string).toISOString(),
      }));
  }, [events]);

  const { data: weatherData } = trpc.weather.forEvents.useQuery(
    { events: weatherInput },
    { enabled: weatherInput.length > 0, staleTime: 60 * 60 * 1000 }
  );

  return (
    <div className="px-4 py-3">
      <SectionHeader
        icon={Clock}
        title="Coming Up"
        size="sm"
        action={
          <Link href="/calendar" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 pb-1 border-b border-primary/30 hover:border-primary transition-colors">
            View Full Calendar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="flex flex-wrap gap-1.5 pb-3 mb-3 border-b border-border/30">
        {CATEGORIES.filter(c => c.key === "all" || (counts[c.key] || 0) > 0).map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveFilter(cat.key)}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-150 ${
              activeFilter === cat.key
                ? "bg-primary text-white shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {cat.label}
            {counts[cat.key] ? ` ${counts[cat.key]}` : ""}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-3 text-center">No upcoming events in this category</p>
        ) : (
          filteredEvents.slice(0, 5).map((evt, i) => {
            const eventDate = toEastern(evt.eventDate as unknown as string);
            const colors = catColors[evt.category] || catColors.parish;
            const countdown = getCountdown(eventDate);
            const evtKey = evt.id?.toString() || evt.title;
            const evtWeather = weatherData?.[evtKey];
            return (
              <div key={evt.id || i} className="group py-2 px-2 -mx-2 rounded-lg hover:bg-muted/40 transition-colors">
                <div className="flex items-start sm:items-center gap-3">
                  <Link href="/calendar" className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex flex-col items-center justify-center shrink-0`}>
                      <span className="text-xs font-bold uppercase leading-none text-primary/70">{format(eventDate, "MMM")}</span>
                      <span className="text-lg font-bold leading-tight text-primary">{format(eventDate, "d")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">{evt.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{evt.location || format(eventDate, "EEEE \u00b7 h:mm a")}</p>
                      <span className="inline-flex sm:hidden text-xs font-medium text-gold bg-gold/15 px-2 py-0.5 rounded-full mt-1">{countdown}</span>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadICS({ title: evt.title, startDate: eventDate, location: evt.location || "St. Patrick Church, 29 Cox Ave, Armonk NY 10504" });
                      toast.success("Calendar event downloaded");
                    }}
                    className="shrink-0 p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    title="Add to Calendar"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </button>
                  <span className="hidden sm:inline-flex text-xs font-medium text-gold bg-gold/15 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">{countdown}</span>
                </div>
                {evtWeather?.weather && (
                  <div className="ml-[52px] mt-1">
                    <WeatherBadge weather={evtWeather.weather} compact />
                    {evtWeather.parkingAdvisory && (
                      <div className="mt-1"><ParkingAdvisory advisory={evtWeather.parkingAdvisory} /></div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
