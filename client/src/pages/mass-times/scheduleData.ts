/**
 * Mass Times Schedule Data & Utility Functions
 * Thin adapter over shared/scheduleEngine — single source of truth.
 * Types, weekly schedule, holy days, and time parsing helpers.
 */

import { Church, Cross, Sun, Clock } from "lucide-react";
import {
  DEFAULT_PARISH_SCHEDULE,
  parseTimeToMinutes,
  minutesToTimeString,
  getUpcomingHolyDays as engineGetUpcomingHolyDays,
  type ScheduledService,
} from "../../../../shared/scheduleEngine";

export type ServiceType = "mass" | "confession" | "prayer" | "adoration" | "none";

export interface Service {
  type: ServiceType;
  name: string;
  time: string;
  note?: string;
  durationMin?: number;
}

export interface DaySchedule {
  day: string;
  shortDay: string;
  services: Service[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Build BASE_WEEKLY_SCHEDULE from the shared engine.
 */
function buildBaseSchedule(): DaySchedule[] {
  const schedule: DaySchedule[] = [];
  for (let day = 0; day <= 6; day++) {
    const dayServices = DEFAULT_PARISH_SCHEDULE.services
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

    const services: Service[] = dayServices.map(s => {
      // For confession, show the time range
      if (s.type === "confession") {
        const endMin = parseTimeToMinutes(s.time) + s.durationMin;
        const endTime = minutesToTimeString(endMin);
        const startShort = s.time.replace(" PM", "").replace(" AM", "");
        const endShort = endTime.replace(" PM", "").replace(" AM", "");
        const period = s.time.includes("PM") ? "PM" : "AM";
        return {
          type: s.type as ServiceType,
          name: s.name,
          time: `${startShort}–${endShort} ${period}`,
          note: s.note,
          durationMin: s.durationMin,
        };
      }
      return {
        type: s.type as ServiceType,
        name: s.name,
        time: s.time,
        note: s.seasonal?.note || s.note,
        durationMin: s.durationMin,
      };
    });

    if (services.length === 0) {
      services.push({ type: "none", name: "No scheduled services", time: "" });
    }

    schedule.push({
      day: DAY_NAMES[day],
      shortDay: SHORT_DAYS[day],
      services,
    });
  }
  return schedule;
}

export const BASE_WEEKLY_SCHEDULE: DaySchedule[] = buildBaseSchedule();

// Get the weekly schedule (now fully derived from the schedule engine)
export function getWeeklySchedule(today: number): DaySchedule[] {
  return BASE_WEEKLY_SCHEDULE.map(day => ({ ...day, services: [...day.services] }));
}

// Parse a time string like "8:30 AM" or "4:30–5:15 PM" into { hours, minutes } (24h)
export function parseTimeStr(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3];
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

// Compute countdown string from now to a target time today or on a future day
export function getCountdown(targetHours: number, targetMinutes: number, currentHour: number, currentMinute: number, daysAhead: number): string {
  let totalMinutes = (targetHours * 60 + targetMinutes) - (currentHour * 60 + currentMinute) + daysAhead * 1440;
  if (totalMinutes <= 0) return "";
  if (totalMinutes > 1440) return "";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `in ${m}m`;
  if (m === 0) return `in ${h}h`;
  return `in ${h}h ${m}m`;
}

// Check for upcoming Holy Days within the next 7 days (delegates to shared engine)
export function getUpcomingHolyDays(): { name: string; date: Date; massTimes: string[]; daysUntil: number }[] {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  return engineGetUpcomingHolyDays(DEFAULT_PARISH_SCHEDULE, now, 7);
}

// Check if a service is currently in progress
function getServiceDuration(type: ServiceType): number {
  switch (type) {
    case "mass": return 60;
    case "confession": return 45;
    case "prayer": return 30;
    case "adoration": return 600;
    default: return 30;
  }
}

export function isServiceInProgress(timeStr: string, type: ServiceType, currentHour: number, currentMinute: number, isToday: boolean): boolean {
  if (!isToday || !timeStr) return false;
  const startMatch = timeStr.match(/^(\d{1,2}):(\d{2})/);
  const periodMatch = timeStr.match(/(AM|PM)/);
  if (!startMatch || !periodMatch) return false;
  let startHours = parseInt(startMatch[1]);
  const startMinutes = parseInt(startMatch[2]);
  const period = periodMatch[1];
  if (period === "PM" && startHours !== 12) startHours += 12;
  if (period === "AM" && startHours === 12) startHours = 0;

  const startTotal = startHours * 60 + startMinutes;
  const nowTotal = currentHour * 60 + currentMinute;
  const duration = getServiceDuration(type);

  return nowTotal >= startTotal && nowTotal < startTotal + duration;
}

export function getServiceColor(type: ServiceType) {
  switch (type) {
    case "mass": return { bg: "bg-primary/8", text: "text-primary", border: "border-l-primary", dot: "bg-primary" };
    case "confession": return { bg: "bg-purple-500/8", text: "text-purple-600", border: "border-l-purple-500", dot: "bg-purple-500" };
    case "prayer": return { bg: "bg-amber-500/8", text: "text-amber-600", border: "border-l-amber-500", dot: "bg-amber-500" };
    case "adoration": return { bg: "bg-rose-500/8", text: "text-rose-600", border: "border-l-rose-500", dot: "bg-rose-500" };
    case "none": return { bg: "bg-muted/30", text: "text-muted-foreground", border: "border-l-muted", dot: "bg-muted-foreground" };
  }
}

export function getServiceIcon(type: ServiceType) {
  switch (type) {
    case "mass": return Church;
    case "confession": return Cross;
    case "prayer": return Sun;
    case "adoration": return Sun;
    case "none": return Clock;
  }
}
