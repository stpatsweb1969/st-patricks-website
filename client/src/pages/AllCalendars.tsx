/**
 * All Calendars Page — Unified calendar view with source filtering and weather enrichment.
 */

import { useMemo, useState } from "react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { FilterNav } from "./calendars/FilterNav";
import { EventCard } from "./calendars/EventCard";
import {
  toEastern, getWeekGroup, ALWAYS_EXPANDED, sacramentPatterns,
  sourceConfig, type SourceFilter, type UnifiedEvent,
} from "./calendars/calendarData";

export default function AllCalendars() {
  const { data: allEvents, isLoading } = trpc.googleCalendar.allEvents.useQuery();
  const { data: keyDatesRaw, isLoading: keyDatesLoading } = trpc.importantDates.allPublished.useQuery();

  const [activeSource, setActiveSource] = useState<SourceFilter>(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    const validFilters: SourceFilter[] = ["all", "key-dates", "parish", "ccd", "cyo", "sacrament"];
    if (filter && validFilters.includes(filter as SourceFilter)) return filter as SourceFilter;
    return "all";
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // Normalize key dates into unified shape
  const keyDatesNormalized = useMemo(() => {
    if (!keyDatesRaw) return [];
    const now = new Date();
    return keyDatesRaw
      .filter(d => new Date(d.eventDate as unknown as string) >= now)
      .map(d => ({
        id: `kd-${d.id}`,
        title: d.title,
        startDate: d.eventDate as unknown as string,
        endDate: null as string | null,
        location: d.location || null,
        description: d.note || null,
        allDay: true,
        source: "key-dates" as const,
        category: d.category,
      }));
  }, [keyDatesRaw]);

  // Filter events by source
  const filteredEvents: UnifiedEvent[] = useMemo(() => {
    if (activeSource === "key-dates") return keyDatesNormalized;
    if (!allEvents) return [];
    let events: typeof allEvents;
    if (activeSource === "sacrament") {
      events = allEvents.filter((e) => sacramentPatterns.test(e.title.trim()));
    } else if (activeSource === "parish") {
      events = allEvents.filter((e) => e.source === "parish" && !sacramentPatterns.test(e.title.trim()));
    } else {
      events = activeSource === "all" ? allEvents : allEvents.filter((e) => e.source === activeSource);
    }
    const mapped = events.map(e => ({
      id: e.id,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate || null,
      location: e.location || null,
      description: e.description || null,
      allDay: e.allDay,
      source: e.source,
    }));
    if (activeSource === "all" && keyDatesNormalized.length > 0) {
      const existingKeys = new Set(mapped.map(e => `${e.title.toLowerCase().trim()}|${new Date(e.startDate).toISOString().slice(0, 10)}`));
      const uniqueKeyDates = keyDatesNormalized.filter(kd => {
        const key = `${kd.title.toLowerCase().trim()}|${new Date(kd.startDate).toISOString().slice(0, 10)}`;
        return !existingKeys.has(key);
      });
      const combined = [...mapped, ...uniqueKeyDates];
      combined.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      return combined;
    }
    return mapped;
  }, [allEvents, keyDatesNormalized, activeSource]);

  // Group events by time period
  const groupedEvents = useMemo(() => {
    const groups: { label: string; events: UnifiedEvent[]; isCollapsible: boolean }[] = [];
    let currentGroup = "";
    for (const event of filteredEvents) {
      const date = toEastern(event.startDate);
      const group = getWeekGroup(date);
      if (group !== currentGroup) {
        currentGroup = group;
        groups.push({ label: group, events: [], isCollapsible: !ALWAYS_EXPANDED.has(group) });
      }
      groups[groups.length - 1].events.push(event);
    }
    return groups;
  }, [filteredEvents]);

  // Count events per source for badges
  const counts = useMemo(() => {
    if (!allEvents) return { all: 0, parish: 0, ccd: 0, cyo: 0, sacrament: 0 };
    const sacramentCount = allEvents.filter((e) => sacramentPatterns.test(e.title.trim())).length;
    return {
      all: allEvents.length + keyDatesNormalized.length,
      parish: allEvents.filter((e) => e.source === "parish" && !sacramentPatterns.test(e.title.trim())).length,
      ccd: allEvents.filter((e) => e.source === "ccd").length,
      cyo: allEvents.filter((e) => e.source === "cyo").length,
      sacrament: sacramentCount,
    };
  }, [allEvents, keyDatesNormalized]);

  const keyDatesCount = keyDatesNormalized.length;

  // Weather enrichment for events within 7 days
  const weatherInput = useMemo(() => {
    if (activeSource === "key-dates") return [];
    if (!filteredEvents || filteredEvents.length === 0) return [];
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return filteredEvents
      .filter(e => { const d = new Date(e.startDate); return d >= now && d <= sevenDays; })
      .map(e => ({
        id: String(e.id),
        title: e.title,
        description: e.description || undefined,
        location: e.location || undefined,
        startDate: e.startDate,
      }));
  }, [filteredEvents, activeSource]);

  const { data: weatherData } = trpc.weather.forEvents.useQuery(
    { events: weatherInput },
    { enabled: weatherInput.length > 0 && activeSource !== "key-dates", staleTime: 60 * 60 * 1000 }
  );

  // Page metadata
  const pageTitle = activeSource === "all"
    ? "Parish Calendar"
    : activeSource === "key-dates"
      ? "Key Dates"
      : `${sourceConfig[activeSource].label} Calendar`;
  const pageDescription = activeSource === "all"
    ? "All upcoming events across Parish, CCD, and CYO."
    : activeSource === "key-dates"
      ? "Important parish events and milestones."
      : `Upcoming ${sourceConfig[activeSource].label} events and activities.`;

  const isLoadingContent = activeSource === "key-dates" ? keyDatesLoading : isLoading;

  return (
    <PageLayout hideBackButton>
      <FilterNav
        activeSource={activeSource}
        setActiveSource={setActiveSource}
        counts={counts}
        keyDatesCount={keyDatesCount}
      />

      <PageHeader
        eyebrow={activeSource === "key-dates" ? "Important Dates" : "Stay Connected"}
        title={pageTitle}
        description={pageDescription}
      />

      <section className="py-8 sm:py-12">
        <div className="container max-w-4xl">
          {isLoadingContent ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg border">
                  <Skeleton className="w-12 h-14 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Calendar className="w-10 h-10 text-primary/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {activeSource === "all"
                  ? "No upcoming events found."
                  : activeSource === "key-dates"
                    ? "No upcoming key dates."
                    : `No upcoming ${sourceConfig[activeSource]?.label} events.`}
              </p>
              {activeSource !== "all" && (
                <button
                  onClick={() => setActiveSource("all")}
                  className="text-primary text-sm mt-2 hover:underline"
                >
                  Show all events
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedEvents.map((group) => {
                const isExpanded = !group.isCollapsible || expandedGroups.has(group.label);
                return (
                  <div key={group.label}>
                    {group.isCollapsible ? (
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="w-full sticky top-[52px] z-10 bg-background/95 backdrop-blur-sm py-2.5 mb-3 border-b border-border/50 flex items-center justify-between group cursor-pointer"
                      >
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                          {group.label}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground/70">
                            {group.events.length} event{group.events.length !== 1 ? "s" : ""}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                    ) : (
                      <div className="sticky top-[52px] z-10 bg-background/95 backdrop-blur-sm py-2 mb-3 border-b border-border/50">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h3>
                      </div>
                    )}

                    <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="space-y-2">
                        {group.events.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            activeSource={activeSource}
                            weatherData={weatherData as any}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
