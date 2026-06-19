/**
 * Schedule Config — Thin adapter over shared/scheduleEngine.
 * 
 * All actual schedule data comes from the shared engine (single source of truth).
 * This file provides backward-compatible exports for ThisWeekAccordion,
 * DayContent, ServiceCard, and RainAlertBanner.
 */
import { Church, Cross, Sun, Heart } from "lucide-react";
import {
  parseTimeToMinutes,
  getServicesForDate,
  DEFAULT_PARISH_SCHEDULE,
  TIMEZONE as ENGINE_TZ,
  DAY_LABELS as ENGINE_DAYS,
} from "../../../../shared/scheduleEngine";

// Re-export types and constants
export const TIMEZONE = ENGINE_TZ;
export const DAY_LABELS = ENGINE_DAYS;
export const parseServiceMinutes = parseTimeToMinutes;

export interface ScheduleItem {
  time: string;
  label: string;
  type: "mass" | "confession" | "prayer" | "adoration";
}

export const SERVICE_DURATION: Record<string, number> = {
  mass: 60,
  confession: 45,
  prayer: 30,
  adoration: 60,
};

export const typeStyles: Record<string, { icon: typeof Church; color: string; bg: string; borderColor: string }> = {
  mass: { icon: Church, color: "text-primary", bg: "bg-primary/10", borderColor: "border-l-primary" },
  confession: { icon: Cross, color: "text-purple-600", bg: "bg-purple-500/10", borderColor: "border-l-purple-500" },
  prayer: { icon: Sun, color: "text-amber-600", bg: "bg-amber-500/10", borderColor: "border-l-amber-500" },
  adoration: { icon: Heart, color: "text-rose-600", bg: "bg-rose-500/10", borderColor: "border-l-rose-500" },
};

/**
 * getScheduleForDate — date-aware schedule builder that respects firstOfMonth.
 * Used by ThisWeekAccordion to get the correct services for each specific date.
 */
export function getScheduleForDate(date: Date): ScheduleItem[] {
  const services = getServicesForDate(DEFAULT_PARISH_SCHEDULE, date);
  return services.map(s => ({
    time: s.time,
    label: s.name,
    type: s.type as "mass" | "confession" | "prayer" | "adoration",
  }));
}

/**
 * DAILY_SCHEDULE — backward-compatible static map for today's week.
 * Uses date-aware filtering for the next 7 days starting from today.
 */
function buildDailyScheduleForWeek(): Record<number, ScheduleItem[]> {
  const today = new Date();
  const result: Record<number, ScheduleItem[]> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    // Use the date-aware version for today's actual week
    result[dayOfWeek] = getScheduleForDate(date);
  }
  return result;
}

export const DAILY_SCHEDULE: Record<number, ScheduleItem[]> = buildDailyScheduleForWeek();
