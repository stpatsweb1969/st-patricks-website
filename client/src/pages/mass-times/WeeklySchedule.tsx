/**
 * Weekly Schedule — Interactive day tabs with service cards, countdowns, and live status.
 */

import { useState, useMemo, useRef, useCallback } from "react";
import { Calendar, CalendarPlus } from "lucide-react";
import { downloadMassICS } from "@/lib/icsGenerator";
import {
  getWeeklySchedule, parseTimeStr, getCountdown, isServiceInProgress,
  getServiceColor, getServiceIcon,
} from "./scheduleData";

export function WeeklySchedule() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const today = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const tomorrow = (today + 1) % 7;

  const WEEKLY_SCHEDULE = useMemo(() => getWeeklySchedule(today), [today]);

  // Auto-advance to tomorrow if all of today's services have completed
  const allTodayServicesPast = useMemo(() => {
    const todaySchedule = WEEKLY_SCHEDULE[today];
    if (todaySchedule.services.length === 1 && todaySchedule.services[0].type === "none") return true;
    return todaySchedule.services.every(service => {
      if (!service.time) return true;
      const parsed = parseTimeStr(service.time);
      if (!parsed) return true;
      return currentHour > parsed.hours || (currentHour === parsed.hours && currentMinute > parsed.minutes);
    });
  }, [today, currentHour, currentMinute, WEEKLY_SCHEDULE]);

  const [selectedDay, setSelectedDay] = useState(() => allTodayServicesPast ? tomorrow : today);

  // Reorder days starting from today
  const reorderedDays = useMemo(() => {
    const days = WEEKLY_SCHEDULE.map((day, index) => ({ ...day, originalIndex: index }));
    return [...days.slice(today), ...days.slice(0, today)];
  }, [today, WEEKLY_SCHEDULE]);

  const currentSchedule = useMemo(() => WEEKLY_SCHEDULE[selectedDay], [selectedDay, WEEKLY_SCHEDULE]);

  const isServicePast = useCallback((timeStr: string) => {
    if (!timeStr || selectedDay !== today) return false;
    const parsed = parseTimeStr(timeStr);
    if (!parsed) return false;
    return currentHour > parsed.hours || (currentHour === parsed.hours && currentMinute > parsed.minutes);
  }, [selectedDay, today, currentHour, currentMinute]);

  const nextServiceIndex = useMemo(() => {
    // "Next" only applies to the day that actually contains the next upcoming service:
    //  - today, if today still has an upcoming service
    //  - tomorrow (auto-advance), only when all of today's services are past
    const isNextDay =
      (selectedDay === today && !allTodayServicesPast) ||
      (allTodayServicesPast && selectedDay === tomorrow);
    if (!isNextDay) return -1;

    const services = WEEKLY_SCHEDULE[selectedDay].services;

    // Auto-advanced to tomorrow → the first real service of tomorrow is "next".
    if (selectedDay !== today) {
      return services.findIndex(s => s.type !== "none" && s.time);
    }

    // Today → first service whose start time is still in the future.
    for (let i = 0; i < services.length; i++) {
      if (services[i].type === "none" || !services[i].time) continue;
      const parsed = parseTimeStr(services[i].time);
      if (!parsed) continue;
      const isPast = currentHour > parsed.hours || (currentHour === parsed.hours && currentMinute > parsed.minutes);
      if (!isPast) return i;
    }
    return -1;
  }, [selectedDay, today, tomorrow, allTodayServicesPast, currentHour, currentMinute, WEEKLY_SCHEDULE]);

  const serviceCountdowns = useMemo(() => {
    const services = WEEKLY_SCHEDULE[selectedDay].services;
    const daysAhead = selectedDay === today ? 0 : ((selectedDay - today + 7) % 7);
    const result: Record<number, string> = {};
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      if (!service?.time) continue;
      const parsed = parseTimeStr(service.time);
      if (!parsed) continue;
      const countdown = getCountdown(parsed.hours, parsed.minutes, currentHour, currentMinute, daysAhead);
      if (countdown) result[i] = countdown;
    }
    return result;
  }, [selectedDay, today, currentHour, currentMinute, WEEKLY_SCHEDULE]);

  // Swipe gesture for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchEndX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      const currentIdx = reorderedDays.findIndex(d => d.originalIndex === selectedDay);
      if (diff > 0 && currentIdx < reorderedDays.length - 1) setSelectedDay(reorderedDays[currentIdx + 1].originalIndex);
      else if (diff < 0 && currentIdx > 0) setSelectedDay(reorderedDays[currentIdx - 1].originalIndex);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
          <Calendar className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-serif text-xl font-bold">Weekly Schedule</h2>
      </div>

      {/* Day Tab Bar */}
      <div className="flex gap-0.5 mb-5 p-1 bg-muted/40 rounded-xl overflow-x-auto">
        {reorderedDays.map((day) => {
          const isSelected = selectedDay === day.originalIndex;
          const isToday = today === day.originalIndex;
          const isTomorrow = tomorrow === day.originalIndex;
          return (
            <button
              key={day.shortDay}
              onClick={() => setSelectedDay(day.originalIndex)}
              className={`relative flex-1 min-w-[44px] py-2.5 px-1.5 rounded-lg text-center transition-all duration-200 ${isSelected ? "bg-white text-foreground shadow-sm ring-1 ring-border/50" : "hover:bg-white/50 text-muted-foreground"}`}
            >
              <span className={`block text-xs font-semibold uppercase tracking-wide ${isSelected ? "text-primary" : ""}`}>{day.shortDay}</span>
              {isToday && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-primary" : "bg-primary/60"}`} />}
              {isTomorrow && !isToday && <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-medium ${isSelected ? "text-muted-foreground" : "text-muted-foreground/60"}`}>tmrw</span>}
            </button>
          );
        })}
      </div>

      {/* Selected Day Content */}
      <div className="animate-fade-in" key={selectedDay} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base text-foreground">{currentSchedule.day}</h3>
          {selectedDay === today && <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/8 px-2.5 py-1 rounded-full">Today</span>}
          {selectedDay === tomorrow && <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-500/8 px-2.5 py-1 rounded-full">Tomorrow</span>}
        </div>

        <div className="space-y-2">
          {currentSchedule.services.map((service, idx) => {
            const colors = getServiceColor(service.type);
            const Icon = getServiceIcon(service.type);
            const past = isServicePast(service.time);
            const isNext = idx === nextServiceIndex;
            const inProgress = isServiceInProgress(service.time, service.type, currentHour, currentMinute, selectedDay === today);
            return (
              <div key={idx} className={`flex items-center gap-3 p-3.5 rounded-xl border-l-3 ${inProgress ? "border-l-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/50 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : isNext ? "border-l-primary ring-1 ring-primary/20 bg-primary/4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : `${colors.border} bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]`} transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${past && !inProgress ? "opacity-50" : ""}`}>
                <div className={`relative w-9 h-9 rounded-lg ${inProgress ? "bg-emerald-500/12" : isNext ? "bg-primary/12" : colors.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${inProgress ? "text-emerald-600" : isNext ? "text-primary" : colors.text}`} />
                  {inProgress && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${past && !inProgress ? "text-muted-foreground" : inProgress ? "text-emerald-700" : isNext ? "text-primary" : "text-foreground"}`}>{service.name}</p>
                    {inProgress && <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-emerald-500 px-1.5 py-0.5 rounded-full animate-pulse">Live</span>}
                    {isNext && !inProgress && <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-primary px-1.5 py-0.5 rounded-full">Next</span>}
                  </div>
                  {service.note && <p className="text-xs text-muted-foreground mt-0.5">{service.note}</p>}
                  {inProgress && <p className="text-xs font-medium text-emerald-600 mt-0.5">In progress now</p>}
                  {past && !inProgress && <p className="text-xs font-medium text-muted-foreground mt-0.5">Completed</p>}
                </div>
                <div className="shrink-0 text-right flex items-center gap-2">
                  <div>
                    {service.time && <span className={`text-sm font-bold ${past && !inProgress ? "text-muted-foreground" : inProgress ? "text-emerald-600" : isNext ? "text-primary" : colors.text} tabular-nums`}>{service.time}</span>}
                    {!inProgress && !past && serviceCountdowns[idx] && <p className={`text-xs font-medium mt-0.5 ${isNext ? "text-primary/70" : "text-muted-foreground"}`}>{serviceCountdowns[idx]}</p>}
                  </div>
                  {service.time && service.type !== "none" && (
                    <button
                      onClick={() => downloadMassICS({ title: service.name, day: currentSchedule.day, time: service.time, location: "St. Patrick's Church, 29 Cox Ave, Armonk, NY 10504", durationMin: service.durationMin })}
                      className="p-1.5 rounded-md hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
                      title="Add to Calendar"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {currentSchedule.services.length === 1 && currentSchedule.services[0].type === "none" && (
          <p className="text-xs text-muted-foreground mt-3 pl-1 italic">
            The parish office is closed on Mondays. See you Tuesday!
          </p>
        )}
      </div>
    </div>
  );
}
