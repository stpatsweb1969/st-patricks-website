/**
 * DayContent — renders the selected day's services with smart auto-advance.
 * When all today's events have ended and user is viewing today, shows
 * "No more events today" + tomorrow's upcoming events automatically.
 */

import { useMemo } from "react";
import { format, addDays } from "date-fns";
import { ColorfulWeatherIcon } from "@/components/WeatherIcons";
import { ServiceCard } from "./ServiceCard";
import { type ScheduleItem, DAILY_SCHEDULE, parseServiceMinutes, TIMEZONE, getScheduleForDate } from "./scheduleConfig";

interface DayData {
  index: number;
  dayOfWeek: number;
  date: Date;
  services: ScheduleItem[];
  isToday: boolean;
  label: string;
  dateNum: number;
}

interface DayContentProps {
  selectedDayData: DayData | undefined;
  selectedIndex: number;
  now: Date;
  dailyForecast: any;
  services: ScheduleItem[];
  pastServices: Record<number, boolean>;
  inProgress: Record<number, string>;
  countdowns: Record<number, string>;
  nextServiceIdx: number;
  dayName: string;
  serviceWeatherMap: any;
}

function WeatherBadge({ forecast }: { forecast: any }) {
  if (!forecast) return null;
  const isSevere = forecast.precipProbabilityMax > 70;
  const isRain = forecast.precipProbabilityMax > 40;
  const badgeCls = isSevere
    ? "weather-badge-severe"
    : isRain
    ? "weather-badge-rain"
    : "weather-badge-clear";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>
      <ColorfulWeatherIcon icon={forecast.icon || "clear"} className="w-4 h-4" />
      <span className="font-semibold">{forecast.high}°</span>
      <span className="text-muted-foreground/70">/</span>
      <span>{forecast.low}°</span>
      {forecast.precipProbabilityMax > 20 && (
        <span className="inline-flex items-center gap-0.5 weather-strip-rain-text">
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          {forecast.precipProbabilityMax}%
        </span>
      )}
    </span>
  );
}

export function DayContent({
  selectedDayData,
  selectedIndex,
  now,
  dailyForecast,
  services,
  pastServices,
  inProgress,
  countdowns,
  nextServiceIdx,
  dayName,
  serviceWeatherMap,
}: DayContentProps) {
  // Determine if all today's events have ended
  const allTodayEnded = useMemo(() => {
    if (!selectedDayData?.isToday || services.length === 0) return false;
    return services.every((_, idx) => pastServices[idx]);
  }, [selectedDayData, services, pastServices]);

  // Get tomorrow's services for auto-advance
  const tomorrowData = useMemo(() => {
    if (!allTodayEnded) return null;
    const tomorrow = addDays(now, 1);
    const tomorrowDow = tomorrow.getDay();
    const tomorrowServices = getScheduleForDate(tomorrow);
    return { date: tomorrow, services: tomorrowServices, dayOfWeek: tomorrowDow };
  }, [allTodayEnded, now]);

  // Compute countdowns for tomorrow's services
  const tomorrowCountdowns = useMemo(() => {
    if (!tomorrowData || tomorrowData.services.length === 0) return {};
    const et = new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
    const currentMin = et.getHours() * 60 + et.getMinutes();
    const todayDow = et.getDay();
    const daysAhead = (tomorrowData.dayOfWeek - todayDow + 7) % 7;
    const result: Record<number, string> = {};
    for (let i = 0; i < tomorrowData.services.length; i++) {
      const svcMin = parseServiceMinutes(tomorrowData.services[i].time);
      const totalMinAhead = daysAhead * 1440 + svcMin - currentMin;
      if (totalMinAhead > 0) {
        const hrs = Math.floor(totalMinAhead / 60);
        const mins = totalMinAhead % 60;
        result[i] = hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
      }
    }
    return result;
  }, [tomorrowData]);

  const tomorrowDayName = tomorrowData
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][tomorrowData.dayOfWeek]
    : "";

  // --- Render ---

  // If today and all events ended: show auto-advance
  if (allTodayEnded && tomorrowData) {
    return (
      <>
        {/* Today header with "no more events" */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-foreground">Today</h3>
          <WeatherBadge forecast={dailyForecast?.[selectedIndex]} />
        </div>
        <p className="text-sm text-muted-foreground py-2 mb-4 border-b border-border/30">
          No more events today
        </p>

        {/* Tomorrow's upcoming events */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-foreground">
            Tomorrow, {format(tomorrowData.date, "EEE MMM d")}
          </h3>
          <WeatherBadge forecast={dailyForecast?.[selectedIndex + 1]} />
        </div>
        {tomorrowData.services.length > 0 ? (
          <div className="space-y-2">
            {tomorrowData.services.map((svc, idx) => {
              const tomorrowWeather = serviceWeatherMap?.[`svc-tomorrow-${idx}`]?.weather || null;
              return (
                <ServiceCard
                  key={`tomorrow-${idx}`}
                  svc={svc}
                  idx={idx}
                  isPast={false}
                  isLive={false}
                  isNext={idx === 0}
                  countdown={tomorrowCountdowns[idx]}
                  progress={undefined}
                  dayName={tomorrowDayName}
                  weather={tomorrowWeather}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3 italic">
            No scheduled services tomorrow
          </p>
        )}
      </>
    );
  }

  // Normal rendering for selected day
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-bold text-foreground">
          {selectedDayData?.isToday ? "Today" : format(selectedDayData?.date || now, "EEEE")}
        </h3>
        <div className="flex items-center gap-2">
          <WeatherBadge forecast={dailyForecast?.[selectedIndex]} />
          {services.length === 0 && !dailyForecast?.[selectedIndex] && (
            <span className="text-xs text-muted-foreground italic">No services</span>
          )}
        </div>
      </div>

      {services.length > 0 ? (
        <div className="space-y-2 mb-3">
          {services.map((svc, idx) => {
            const eventId = `svc-${selectedIndex}-${idx}`;
            const svcWeather = serviceWeatherMap?.[eventId]?.weather || null;
            return (
              <ServiceCard
                key={`svc-${idx}`}
                svc={svc}
                idx={idx}
                isPast={!!pastServices[idx]}
                isLive={!!inProgress[idx]}
                isNext={idx === nextServiceIdx && !inProgress[idx] && !pastServices[idx]}
                countdown={countdowns[idx]}
                progress={inProgress[idx]}
                dayName={dayName}
                weather={svcWeather}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4 italic">
          No scheduled services on this day
        </p>
      )}
    </>
  );
}
