/**
 * Service Card — Individual service row with live/next/past state, countdown, and weather.
 */

import { CalendarPlus, Check } from "lucide-react";
import { ColorfulWeatherIcon, DropletIcon } from "@/components/WeatherIcons";
import { downloadMassICS } from "@/lib/icsGenerator";
import { typeStyles, type ScheduleItem } from "./scheduleConfig";

interface EventWeather {
  temperature: number;
  feelsLike: number;
  precipProbability: number;
  precipAmount: number;
  weatherCode: number;
  description: string;
  icon: string;
  windSpeed: number;
  isDay: boolean;
  isRainWarning: boolean;
  isSevereWarning: boolean;
  forecastStrip: Array<{
    time: string;
    label: string;
    temperature: number;
    precipProbability: number;
    weatherCode: number;
    icon: string;
  }>;
}

interface ServiceCardProps {
  svc: ScheduleItem;
  idx: number;
  isPast: boolean;
  isLive: boolean;
  isNext: boolean;
  countdown?: string;
  progress?: string;
  dayName: string;
  weather?: EventWeather | null;
}

export function ServiceCard({ svc, idx, isPast, isLive, isNext, countdown, progress, dayName, weather }: ServiceCardProps) {
  const style = typeStyles[svc.type];
  const Icon = style.icon;

  return (
    <div
      key={`svc-${idx}`}
      className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-l-4 ${
        isPast ? "border-muted-foreground/20" : style.borderColor
      } ${
        isPast
          ? "bg-muted/30 opacity-60"
          : isLive
            ? "bg-emerald-50/80 ring-1 ring-emerald-200 dark:bg-emerald-950/20 dark:ring-emerald-800"
            : isNext
              ? "bg-primary/[0.04] ring-1 ring-primary/20"
              : "bg-card"
      } shadow-sm ${isPast ? "" : "hover:shadow-md"} transition-all duration-200`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0 ${
        isPast ? "bg-muted/50" : isLive ? "bg-emerald-100 dark:bg-emerald-900/30" : style.bg
      } flex items-center justify-center`}>
        {isPast ? (
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/60" />
        ) : (
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLive ? "text-emerald-600" : style.color}`} />
        )}
      </div>

      {/* Title + status */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium flex items-center gap-1.5 flex-wrap ${
          isPast ? "text-muted-foreground" : "text-foreground"
        }`}>
          <span className="whitespace-nowrap">{svc.label}</span>
          {isLive && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
              Live
            </span>
          )}
          {isPast && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-muted text-muted-foreground no-underline" style={{ textDecoration: 'none' }}>
              Ended
            </span>
          )}
        </span>
        {isLive && <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 block font-medium">{progress}</span>}
        {/* Countdown + weather inline on same row below title */}
        {!isPast && !isLive && (countdown || weather) && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {countdown && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-tight whitespace-nowrap">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary/60" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" /></span>
                {countdown}
              </span>
            )}
            {weather && (
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  weather.isSevereWarning
                    ? "weather-badge-severe"
                    : weather.isRainWarning
                    ? "weather-badge-rain"
                    : "weather-badge-clear"
                }`}
              >
                <ColorfulWeatherIcon icon={weather.icon} className="w-3.5 h-3.5" />
                <span className="font-semibold">{weather.temperature}°</span>
                                {weather.precipProbability > 20 && (
                  <span className="flex items-center gap-0.5 weather-strip-rain-text">
                    <DropletIcon className="w-2.5 h-2.5" />
                    {weather.precipProbability}%
                  </span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Weather badge for live/past states (shown in original position) */}
      {weather && isLive && (
        <span
          className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
            weather.isSevereWarning
              ? "weather-badge-severe"
              : weather.isRainWarning
              ? "weather-badge-rain"
              : "weather-badge-clear"
          }`}
        >
          <ColorfulWeatherIcon icon={weather.icon} className="w-3.5 h-3.5" />
          <span className="font-semibold">{weather.temperature}°</span>
          {weather.precipProbability > 20 && (
            <span className="flex items-center gap-0.5 weather-strip-rain-text">
              <DropletIcon className="w-2.5 h-2.5" />
              {weather.precipProbability}%
            </span>
          )}
        </span>
      )}

      {/* Calendar add button */}
      {!isPast && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadMassICS({
              title: `${svc.label} - St. Patrick in Armonk`,
              day: dayName,
              time: svc.time,
            });
          }}
          className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors shrink-0"
          title="Add to Calendar"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Time */}
      <div className="text-right shrink-0">
        <span className={`text-sm font-bold ${
          isPast ? "text-muted-foreground/50" : style.color
        }`}>
          {svc.time}
        </span>
      </div>
    </div>
  );
}
