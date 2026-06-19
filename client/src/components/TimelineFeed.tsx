import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  startOfWeek,
  addWeeks,
  isSameWeek,
  isBefore,
  startOfMonth,
  isSameMonth,
} from "date-fns";

// Category color definitions
const categoryColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  mass: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-l-emerald-500", dot: "bg-emerald-500" },
  liturgy: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-l-emerald-500", dot: "bg-emerald-500" },
  community: { bg: "bg-amber-50", text: "text-amber-700", border: "border-l-amber-500", dot: "bg-amber-500" },
  youth: { bg: "bg-blue-50", text: "text-blue-700", border: "border-l-blue-500", dot: "bg-blue-500" },
  class: { bg: "bg-green-50", text: "text-green-700", border: "border-l-green-600", dot: "bg-green-600" },
  holiday: { bg: "bg-amber-50", text: "text-amber-700", border: "border-l-amber-500", dot: "bg-amber-500" },
  special: { bg: "bg-blue-50", text: "text-blue-700", border: "border-l-blue-500", dot: "bg-blue-500" },
  sacrament: { bg: "bg-purple-50", text: "text-purple-700", border: "border-l-purple-500", dot: "bg-purple-500" },
  practice: { bg: "bg-orange-50", text: "text-orange-700", border: "border-l-orange-500", dot: "bg-orange-500" },
  default: { bg: "bg-gray-50", text: "text-gray-700", border: "border-l-gray-400", dot: "bg-gray-400" },
};

export interface TimelineEvent {
  id: number | string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  category?: string;
  grade?: string | null;
  allDay?: boolean;
}

interface TimelineFeedProps {
  events: TimelineEvent[];
  categories?: string[];
  showFilters?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

function inferCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("mass") || lower.includes("adoration") || lower.includes("rosary") || lower.includes("prayer") || lower.includes("contemplative") || lower.includes("lauds")) return "liturgy";
  if (lower.includes("cyo") || lower.includes("teen") || lower.includes("youth") || lower.includes("blaze")) return "youth";
  if (lower.includes("class") || lower.includes("ccd") || lower.includes("rcia") || lower.includes("formation")) return "class";
  if (lower.includes("basketball") || lower.includes("practice")) return "practice";
  if (lower.includes("holiday") || lower.includes("christmas") || lower.includes("easter") || lower.includes("holy day")) return "holiday";
  if (lower.includes("sacrament") || lower.includes("baptism") || lower.includes("communion") || lower.includes("confirmation")) return "sacrament";
  return "community";
}

function getWeekGroup(date: Date): string {
  const now = new Date();
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date, { weekStartsOn: 0 })) return "This Week";
  
  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 0 });
  if (isSameWeek(date, nextWeekStart, { weekStartsOn: 0 })) return "Next Week";
  
  // Group by month for further out
  return format(date, "MMMM yyyy");
}

export default function TimelineFeed({
  events,
  categories,
  showFilters = true,
  emptyMessage = "No upcoming events",
  emptyIcon,
}: TimelineFeedProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Process events with categories
  const processedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      date: new Date(event.startDate),
      category: event.category || inferCategory(event.title),
    }));
  }, [events]);

  // Get unique categories for filter pills
  const availableCategories = useMemo(() => {
    if (categories) return categories;
    const cats = new Set(processedEvents.map((e) => e.category));
    return Array.from(cats).sort();
  }, [processedEvents, categories]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return processedEvents;
    return processedEvents.filter((e) => e.category === activeFilter);
  }, [processedEvents, activeFilter]);

  // Group events by week/time period
  const groupedEvents = useMemo(() => {
    const groups: { label: string; events: typeof filteredEvents }[] = [];
    let currentGroup = "";

    for (const event of filteredEvents) {
      const group = getWeekGroup(event.date);
      if (group !== currentGroup) {
        currentGroup = group;
        groups.push({ label: group, events: [] });
      }
      groups[groups.length - 1].events.push(event);
    }

    return groups;
  }, [filteredEvents]);

  const categoryLabels: Record<string, string> = {
    all: "All",
    liturgy: "Liturgy",
    mass: "Mass",
    community: "Community",
    youth: "Youth",
    class: "Classes",
    holiday: "Holidays",
    special: "Special",
    sacrament: "Sacraments",
    practice: "Practice",
  };

  if (filteredEvents.length === 0 && processedEvents.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        {emptyIcon && <div className="mb-3">{emptyIcon}</div>}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Pills */}
      {showFilters && availableCategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeFilter === "all"
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
            }`}
          >
            All
          </button>
          {availableCategories.map((cat) => {
            const colors = categoryColors[cat] || categoryColors.default;
            const isActive = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? `${colors.bg} ${colors.text} shadow-sm ring-1 ring-current/20`
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      {groupedEvents.map((group) => (
        <div key={group.label}>
          {/* Sticky Week Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 mb-3 border-b border-border/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
          </div>

          {/* Events in this group */}
          <div className="space-y-2">
            {group.events.map((event) => {
              const colors = categoryColors[event.category] || categoryColors.default;
              const eventDate = event.date;
              const endDate = event.endDate ? new Date(event.endDate) : null;

              return (
                <div
                  key={event.id}
                  className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-l-[3px] ${colors.border} bg-card hover:shadow-sm transition-shadow`}
                >
                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center min-w-[44px] sm:min-w-[52px]">
                    <span className="text-xs sm:text-xs font-medium uppercase text-muted-foreground leading-none">
                      {format(eventDate, "EEE")}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                      {format(eventDate, "d")}
                    </span>
                    <span className="text-xs sm:text-xs text-muted-foreground leading-none">
                      {format(eventDate, "MMM")}
                    </span>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm sm:text-base text-foreground leading-tight">
                        {event.title}
                      </h4>
                      {event.grade && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                          {event.grade}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs sm:text-sm text-muted-foreground">
                      {!event.allDay && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {format(eventDate, "h:mm a")}
                          {endDate && ` – ${format(endDate, "h:mm a")}`}
                        </span>
                      )}
                      {event.allDay && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          All Day
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty state after filtering */}
      {filteredEvents.length === 0 && processedEvents.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No events in this category.</p>
          <button
            onClick={() => setActiveFilter("all")}
            className="text-primary text-sm font-medium mt-2 hover:underline"
          >
            Show all events
          </button>
        </div>
      )}
    </div>
  );
}
