/**
 * Calendar Data — Types, source config, and utility functions for the calendar page.
 */

import { Calendar, BookOpen, Dribbble, Clock } from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, startOfWeek, addWeeks, isSameWeek } from "date-fns";
import { TZDate } from "@date-fns/tz";

// Convert a UTC ISO string to a TZDate in Eastern Time for correct display
export const TIMEZONE = "America/New_York";
export function toEastern(isoString: string): Date {
  return new TZDate(isoString, TIMEZONE);
}

export type SourceFilter = "all" | "key-dates" | "parish" | "ccd" | "cyo" | "sacrament";

export const sourceConfig = {
  parish: { label: "Parish", icon: Calendar, color: "bg-primary/10 text-primary", border: "border-l-primary" },
  ccd: { label: "CCD", icon: BookOpen, color: "bg-green-100 text-green-700", border: "border-l-green-600" },
  cyo: { label: "CYO", icon: Dribbble, color: "bg-orange-100 text-orange-700", border: "border-l-orange-500" },
  sacrament: { label: "Sacrament", icon: Clock, color: "bg-purple-100 text-purple-700", border: "border-l-purple-500" },
};

// Key dates category colors for the border
export const keyDateCategoryBorder: Record<string, string> = {
  ccd: "border-l-green-600",
  cyo: "border-l-orange-500",
  sacrament: "border-l-purple-500",
  parish: "border-l-primary",
  teen_life: "border-l-blue-500",
  social: "border-l-amber-500",
};

export const keyDateCategoryColor: Record<string, string> = {
  ccd: "bg-green-100 text-green-700",
  cyo: "bg-orange-100 text-orange-700",
  sacrament: "bg-purple-100 text-purple-700",
  parish: "bg-primary/10 text-primary",
  teen_life: "bg-blue-100 text-blue-700",
  social: "bg-amber-100 text-amber-700",
};

export const keyDateCategoryLabel: Record<string, string> = {
  ccd: "CCD",
  cyo: "CYO",
  sacrament: "Sacrament",
  parish: "Parish",
  teen_life: "Teen Life",
  social: "Social",
};

// Groups that should always be expanded (near-term)
export const ALWAYS_EXPANDED = new Set(["Today", "Tomorrow", "This Week", "Next Week"]);

export function getWeekGroup(date: Date): string {
  const now = new Date();
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date, { weekStartsOn: 0 })) return "This Week";
  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 0 });
  if (isSameWeek(date, nextWeekStart, { weekStartsOn: 0 })) return "Next Week";
  return format(date, "MMMM yyyy");
}

// Sacrament-related title patterns
export const sacramentPatterns = /^(daily mass|weekday mass|mass|first friday|adoration|eucharistic|confession|reconciliation|communion|confirmation|baptism|anointing|penance)/i;

// Unified event type for rendering
export type UnifiedEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  description: string | null;
  allDay: boolean;
  source: string;
  category?: string;
};
