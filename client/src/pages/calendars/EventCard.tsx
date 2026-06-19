/**
 * Event Card — Individual event row in the calendar list view.
 */

import { Clock, MapPin, Star, MessageCircle, CalendarPlus } from "lucide-react";
import { openParishAssistant } from "@/components/ParishAssistant";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { WeatherBadge, ParkingAdvisory } from "@/components/WeatherBadge";
import { downloadICS } from "@/lib/icsGenerator";
import {
  toEastern, sourceConfig, keyDateCategoryBorder, keyDateCategoryColor,
  keyDateCategoryLabel, sacramentPatterns, type UnifiedEvent,
} from "./calendarData";

interface EventCardProps {
  event: UnifiedEvent;
  activeSource: string;
  weatherData?: Record<string, { weather: any; parkingAdvisory: string | null }>;
}

export function EventCard({ event, activeSource, weatherData }: EventCardProps) {
  const eventDate = toEastern(event.startDate);
  const endDate = event.endDate ? toEastern(event.endDate) : null;
  const isKeyDate = event.source === "key-dates";
  const isKeyDateMatch = isKeyDate && activeSource === "all";
  const eventCategory = (event as any).category as string | undefined;

  // Determine border and badge colors
  const isSacramentEvent = !isKeyDate && sacramentPatterns.test(event.title.trim());
  const borderClass = isKeyDate
    ? (keyDateCategoryBorder[eventCategory || "parish"] || "border-l-gold")
    : isSacramentEvent
      ? sourceConfig.sacrament.border
      : sourceConfig[event.source as keyof typeof sourceConfig]?.border || "border-l-primary";
  const badgeClass = isKeyDate
    ? (keyDateCategoryColor[eventCategory || "parish"] || "bg-gold/10 text-gold")
    : isSacramentEvent
      ? sourceConfig.sacrament.color
      : sourceConfig[event.source as keyof typeof sourceConfig]?.color || "bg-primary/10 text-primary";
  const badgeLabel = isKeyDate
    ? (keyDateCategoryLabel[eventCategory || "parish"] || "Key Date")
    : isSacramentEvent
      ? sourceConfig.sacrament.label
      : sourceConfig[event.source as keyof typeof sourceConfig]?.label || "Parish";

  const eventWeather = weatherData?.[event.id as unknown as number];

  return (
    <div className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-l-[3px] ${borderClass} bg-card hover:shadow-sm transition-shadow`}>
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
          <h4 className="font-semibold text-sm sm:text-base text-foreground leading-tight flex items-center gap-1.5">
            {isKeyDateMatch && <Star className="w-3.5 h-3.5 text-gold fill-gold shrink-0" />}
            {event.title}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            {isKeyDateMatch && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-gold/10 text-gold">Key Date</Badge>
            )}
            <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${badgeClass}`}>{badgeLabel}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs sm:text-sm text-muted-foreground">
          {!event.allDay && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {format(eventDate, "h:mm a")}
              {endDate && ` – ${format(endDate, "h:mm a")}`}
            </span>
          )}
          {event.allDay && !isKeyDate && (
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
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
        )}

        {/* Weather badge for outdoor/high-attendance events */}
        {!isKeyDate && eventWeather?.weather && (
          <div className="mt-2 space-y-1.5">
            <WeatherBadge weather={eventWeather.weather} />
            {eventWeather.parkingAdvisory && <ParkingAdvisory advisory={eventWeather.parkingAdvisory} />}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => {
              downloadICS({
                title: event.title,
                startDate: eventDate,
                endDate: endDate || undefined,
                location: event.location || "St. Patrick Church, 29 Cox Ave, Armonk NY 10504",
                description: event.description || undefined,
                allDay: event.allDay,
              });
            }}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline opacity-70 hover:opacity-100 transition-opacity"
          >
            <CalendarPlus className="w-3 h-3" />
            Add to Calendar
          </button>
          <button
            onClick={() => openParishAssistant(`Tell me about ${event.title} on ${format(eventDate, "MMMM d")}`)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline opacity-70 hover:opacity-100 transition-opacity"
          >
            <MessageCircle className="w-3 h-3" />
            Ask about this
          </button>
        </div>
      </div>
    </div>
  );
}
