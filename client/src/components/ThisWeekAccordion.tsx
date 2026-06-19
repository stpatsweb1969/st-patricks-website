/**
 * This Week Accordion — 7-day schedule widget with live countdowns and weather.
 */

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { trpc } from "@/lib/trpc";
import { ColorfulWeatherIcon } from "@/components/WeatherIcons";
import { ServiceCard } from "./this-week/ServiceCard";
import { DayContent } from "./this-week/DayContent";
import { SundayOutlook } from "./this-week/SundayOutlook";
import {
  DAILY_SCHEDULE, SERVICE_DURATION, parseServiceMinutes,
  DAY_LABELS, TIMEZONE, getScheduleForDate,
} from "./this-week/scheduleConfig";

export function ThisWeekAccordion() {
  const now = useMemo(() => new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE })), []);

  // Build 7 days starting from today (date-aware: respects firstOfMonth)
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(now, i);
      const dayOfWeek = date.getDay();
      const services = getScheduleForDate(date);
      result.push({ index: i, dayOfWeek, date, services, isToday: i === 0, label: DAY_LABELS[dayOfWeek], dateNum: date.getDate() });
    }
    return result;
  }, [now]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Auto-advance: when all today's events have ended, move pill to tomorrow
  const [autoAdvanced, setAutoAdvanced] = useState(false);
  useEffect(() => {
    if (autoAdvanced || selectedIndex !== 0) return;
    const todayServices = days[0]?.services || [];
    if (todayServices.length === 0) return;
    const et = new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
    const currentMin = et.getHours() * 60 + et.getMinutes();
    const allEnded = todayServices.every((svc) => {
      const svcMin = parseServiceMinutes(svc.time);
      const duration = SERVICE_DURATION[svc.type] || 30;
      return currentMin >= svcMin + duration;
    });
    if (allEnded) {
      setSelectedIndex(1);
      setAutoAdvanced(true);
    }
  }, [days, selectedIndex, autoAdvanced]);

  // Compute countdown, in-progress, and past state for each service
  const [countdowns, setCountdowns] = useState<Record<number, string>>({});
  const [inProgress, setInProgress] = useState<Record<number, string>>({});
  const [pastServices, setPastServices] = useState<Record<number, boolean>>({});

  useEffect(() => {
    function computeCountdowns() {
      const et = new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
      const currentMin = et.getHours() * 60 + et.getMinutes();
      const todayDayOfWeek = et.getDay();
      const selected = days[selectedIndex];
      if (!selected) { setCountdowns({}); setInProgress({}); setPastServices({}); return; }
      const svcs = selected.services;
      const newCountdowns: Record<number, string> = {};
      const newInProgress: Record<number, string> = {};
      const newPast: Record<number, boolean> = {};

      const selectedDayOfWeek = selected.dayOfWeek;
      const daysAhead = (selectedDayOfWeek - todayDayOfWeek + 7) % 7;

      for (let i = 0; i < svcs.length; i++) {
        const svc = svcs[i];
        const svcMin = parseServiceMinutes(svc.time);
        const duration = SERVICE_DURATION[svc.type] || 30;

        if (selected.isToday) {
          if (currentMin >= svcMin + duration) { newPast[i] = true; continue; }
          if (currentMin >= svcMin && currentMin < svcMin + duration) {
            const remaining = (svcMin + duration) - currentMin;
            newInProgress[i] = `${remaining}m remaining`;
            continue;
          }
          const diff = svcMin - currentMin;
          if (diff > 0) {
            const hrs = Math.floor(diff / 60);
            const mins = diff % 60;
            newCountdowns[i] = hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
          }
        } else {
          const totalMinAhead = (daysAhead * 1440) + svcMin - currentMin;
          if (totalMinAhead > 0 && totalMinAhead <= 1440) {
            const hrs = Math.floor(totalMinAhead / 60);
            const mins = totalMinAhead % 60;
            newCountdowns[i] = hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
          }
        }
      }
      setCountdowns(newCountdowns);
      setInProgress(newInProgress);
      setPastServices(newPast);
    }
    computeCountdowns();
    const interval = setInterval(computeCountdowns, 30000);
    return () => clearInterval(interval);
  }, [selectedIndex, days]);

  const nextServiceIdx = useMemo(() => {
    const indices = Object.keys(countdowns).map(Number).sort((a, b) => a - b);
    return indices.length > 0 ? indices[0] : -1;
  }, [countdowns]);

  // Swipe gesture for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchEndX.current = e.touches[0].clientX; }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; }, []);
  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedIndex < 6) setSelectedIndex(selectedIndex + 1);
      else if (diff < 0 && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  // Fetch weather data
  // Daily forecast for weather icons in the header
  const { data: dailyForecast } = trpc.weather.daily.useQuery(undefined, { staleTime: 60 * 60 * 1000 });

  // Build event list for the selected day to get per-service weather
  const selectedDayData = days[selectedIndex];
  const services = selectedDayData?.services || [];

  // Determine if auto-advance is active (all today's events ended)
  const allTodayEnded = useMemo(() => {
    if (selectedIndex !== 0 || services.length === 0) return false;
    return Object.keys(pastServices).length === services.length &&
      services.every((_, idx) => pastServices[idx]);
  }, [selectedIndex, services, pastServices]);

  // Build service events for weather query — include tomorrow's if auto-advance is active
  const tomorrowDayData = days[1];
  const tomorrowServices = tomorrowDayData?.services || [];

  const serviceEvents = useMemo(() => {
    const events: Array<{ id: string; title: string; startDate: string }> = [];

    // Selected day events
    if (selectedDayData && services.length > 0) {
      for (let idx = 0; idx < services.length; idx++) {
        const svc = services[idx];
        const svcMin = parseServiceMinutes(svc.time);
        const hours = Math.floor(svcMin / 60);
        const mins = svcMin % 60;
        const d = new Date(selectedDayData.date);
        d.setHours(hours, mins, 0, 0);
        events.push({
          id: `svc-${selectedIndex}-${idx}`,
          title: svc.label,
          startDate: d.toISOString(),
        });
      }
    }

    // Tomorrow's events — always include when viewing today so weather is pre-fetched
    // before allTodayEnded triggers (avoids flash of cards without weather badges)
    if (selectedIndex === 0 && tomorrowDayData && tomorrowServices.length > 0) {
      for (let idx = 0; idx < tomorrowServices.length; idx++) {
        const svc = tomorrowServices[idx];
        const svcMin = parseServiceMinutes(svc.time);
        const hours = Math.floor(svcMin / 60);
        const mins = svcMin % 60;
        const d = new Date(tomorrowDayData.date);
        d.setHours(hours, mins, 0, 0);
        events.push({
          id: `svc-tomorrow-${idx}`,
          title: svc.label,
          startDate: d.toISOString(),
        });
      }
    }

    return events;
  }, [selectedDayData, services, selectedIndex, tomorrowDayData, tomorrowServices]);

  const { data: serviceWeatherMap } = trpc.weather.forEvents.useQuery(
    { events: serviceEvents },
    { enabled: serviceEvents.length > 0, staleTime: 60 * 60 * 1000 }
  );
  const weekStart = days[0]?.date || now;
  const weekEnd = days[6]?.date || now;
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][selectedDayData?.dayOfWeek || 0];

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between bg-muted/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-serif text-lg font-bold text-foreground">This Week</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
        </span>
      </div>

      {/* Day tabs */}
      <div className="flex gap-0.5 p-1 border-b border-border/30 bg-muted/20">
        {days.map((day) => {
          const isSelected = selectedIndex === day.index;
          return (
            <button
              key={day.index}
              onClick={() => setSelectedIndex(day.index)}
              className={`flex-1 min-w-[44px] py-2 px-0.5 rounded-lg text-center transition-all duration-200 relative flex flex-col items-center gap-0.5 ${
                isSelected ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-muted/60 text-muted-foreground"
              }`}
            >
              <span className={`text-xs sm:text-xs font-medium uppercase ${isSelected ? "text-white/80" : ""}`}>{day.label}</span>
              <span className={`text-sm sm:text-base font-bold ${isSelected ? "text-white" : "text-foreground/70"}`}>{day.dateNum}</span>
              {day.isToday && !isSelected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>

      {/* Selected day content */}
      <div className="p-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {/* Swipe navigation hint (mobile only) */}
        <div className="sm:hidden flex items-center justify-center gap-1 mb-2">
          {days.map((day) => (
            <span
              key={day.index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                selectedIndex === day.index ? "bg-primary w-3" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <DayContent
          selectedDayData={selectedDayData}
          selectedIndex={selectedIndex}
          now={now}
          dailyForecast={dailyForecast}
          services={services}
          pastServices={pastServices}
          inProgress={inProgress}
          countdowns={countdowns}
          nextServiceIdx={nextServiceIdx}
          dayName={dayName}
          serviceWeatherMap={serviceWeatherMap}
        />
      </div>

      {/* Sunday Outlook */}
      <div className="px-4 pb-1">
        <SundayOutlook dailyForecast={dailyForecast} />
      </div>

    </div>
  );
}
