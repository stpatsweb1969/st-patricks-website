import PageLayout from "@/components/PageLayout";
import { SEO } from "@/components/SEO";
import { trpc } from "@/lib/trpc";
import PageHeader from "@/components/PageHeader";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { useReveal } from "@/hooks/useReveal";

const TIMEZONE = "America/New_York";
function toEastern(isoString: string): Date {
  return new TZDate(isoString, TIMEZONE);
}

const categories = [
  { key: "all", label: "All", dot: "bg-foreground" },
  { key: "ccd", label: "CCD", dot: "bg-green-500" },
  { key: "cyo", label: "CYO", dot: "bg-orange-500" },
  { key: "sacrament", label: "Sacrament", dot: "bg-purple-500" },
  { key: "parish", label: "Parish", dot: "bg-primary" },
  { key: "teen_life", label: "Teen Life", dot: "bg-blue-500" },
  { key: "social", label: "Social", dot: "bg-amber-500" },
] as const;

const catColors: Record<string, { dot: string; bg: string; label: string }> = {
  ccd: { dot: "bg-green-500", bg: "bg-green-50", label: "CCD" },
  cyo: { dot: "bg-orange-500", bg: "bg-orange-50", label: "CYO" },
  sacrament: { dot: "bg-purple-500", bg: "bg-purple-50", label: "Sacrament" },
  parish: { dot: "bg-primary", bg: "bg-primary/5", label: "Parish" },
  teen_life: { dot: "bg-blue-500", bg: "bg-blue-50", label: "Teen Life" },
  social: { dot: "bg-amber-500", bg: "bg-amber-50", label: "Social" },
};

type MonthGroupData = {
  key: string;
  month: string;
  year: string;
  events: Array<{ id: number; title: string; eventDate: unknown; category: string; location: string | null; note: string | null }>;
};

function MonthGroup({ group }: { group: MonthGroupData }) {
  return (
    <AccordionItem value={group.key} className="border-b last:border-b-0">
      <AccordionTrigger className="px-4 sm:px-5 py-3.5 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-sm sm:text-base">{group.month}</span>
          <span className="text-xs text-muted-foreground">{group.year}</span>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {group.events.length} {group.events.length === 1 ? "event" : "events"}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 sm:px-4 pb-3">
        <div className="grid gap-2 sm:gap-2.5">
          {group.events.map((event) => {
            const cat = catColors[event.category] || catColors.parish;
            const eventDate = toEastern(event.eventDate as unknown as string);
            return (
              <div
                key={event.id}
                className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-lg ${cat.bg} border border-transparent hover:border-border/50 transition-colors`}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white shadow-sm flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-foreground/60 uppercase leading-none">
                    {format(eventDate, "EEE")}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {format(eventDate, "d")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.dot} shrink-0`} />
                    <span className="text-xs font-medium uppercase tracking-wider text-foreground/60">{cat.label}</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm leading-snug">{event.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    {event.location && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                    {event.note && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {event.note}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function KeyDates() {
  const { data: allImportantDates, isLoading } = trpc.importantDates.allPublished.useQuery();
  const revealRef = useReveal();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredDates = useMemo(() => {
    if (!allImportantDates) return [];
    if (activeFilter === "all") return allImportantDates;
    return allImportantDates.filter(e => e.category === activeFilter);
  }, [allImportantDates, activeFilter]);

  const { groupedDates, currentMonthKey } = useMemo(() => {
    if (filteredDates.length === 0) return { groupedDates: [], currentMonthKey: "" };
    const groups: { key: string; month: string; year: string; events: typeof filteredDates }[] = [];
    const now = new Date();
    const currentKey = format(now, "yyyy-MM");
    let foundCurrentMonth = "";
    for (const event of filteredDates) {
      const eventDate = toEastern(event.eventDate as unknown as string);
      const key = format(eventDate, "yyyy-MM");
      const monthLabel = format(eventDate, "MMMM");
      const yearLabel = format(eventDate, "yyyy");
      const existing = groups.find(g => g.key === key);
      if (existing) {
        existing.events.push(event);
      } else {
        groups.push({ key, month: monthLabel, year: yearLabel, events: [event] });
      }
      if (!foundCurrentMonth && key >= currentKey) {
        foundCurrentMonth = key;
      }
    }
    if (!foundCurrentMonth && groups.length > 0) {
      foundCurrentMonth = groups[groups.length - 1].key;
    }
    return { groupedDates: groups, currentMonthKey: foundCurrentMonth };
  }, [filteredDates]);

  // Count events per category for badge numbers
  const categoryCounts = useMemo(() => {
    if (!allImportantDates) return {};
    const counts: Record<string, number> = { all: allImportantDates.length };
    for (const event of allImportantDates) {
      counts[event.category] = (counts[event.category] || 0) + 1;
    }
    return counts;
  }, [allImportantDates]);

  return (
    <PageLayout>
      <SEO
        title="Key Dates & Events"
        path="/key-dates"
        description="Upcoming events, holy days, and important dates at St. Patrick Church, Armonk. Parish calendar, CCD schedule, and community gatherings."
      />
      <div ref={revealRef}>
        {/* Page Header — refined */}
        <PageHeader
          eyebrow="Parish Calendar"
          title="Key Dates"
          description="All important parish events and milestones for the 2026–2027 year"
        >
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((cat) => {
              const isActive = activeFilter === cat.key;
              const count = categoryCounts[cat.key] || 0;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(cat.key)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200 press-scale border
                    ${isActive
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                    }
                  `}
                >
                  {cat.key !== "all" && (
                    <span className={`w-2 h-2 rounded-full ${isActive ? "bg-white/80" : cat.dot}`} />
                  )}
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-muted text-foreground/60"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </PageHeader>

        {/* Accordion */}
        <section className="reveal container pb-12 sm:pb-16 pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : groupedDates.length > 0 ? (
            activeFilter === "all" ? (
              <Accordion type="single" collapsible defaultValue={currentMonthKey} key={activeFilter} className="rounded-xl border overflow-hidden">
                {groupedDates.map((group) => (
                  <MonthGroup key={group.key} group={group} />
                ))}
              </Accordion>
            ) : (
              <Accordion type="multiple" defaultValue={groupedDates.map(g => g.key)} key={activeFilter} className="rounded-xl border overflow-hidden">
                {groupedDates.map((group) => (
                  <MonthGroup key={group.key} group={group} />
                ))}
              </Accordion>
            )
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium">No events found</p>
              <p className="text-sm mt-1">
                {activeFilter !== "all"
                  ? "No events in this category. Try selecting a different filter."
                  : "Check back soon for the updated parish calendar."}
              </p>
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="mt-3 text-sm text-primary hover:underline font-medium"
                >
                  Show all dates
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
