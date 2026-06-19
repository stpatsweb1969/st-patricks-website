/**
 * NextMassCountdown — Dynamic homepage countdown to the next Mass.
 *
 * Features:
 * - Ticks every second (h:mm:ss when < 1 hour, Xh Ym when further away)
 * - "Mass in progress" state with elapsed time bar
 * - Reads from live parish schedule (single source of truth)
 * - Handles seasonal exclusions (e.g. no 12:30 PM in summer)
 * - Add-to-Calendar button on each upcoming Mass
 * - Graceful skeleton while schedule loads
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Clock, ChevronRight, CalendarPlus } from "lucide-react";
import {
  useParishSchedule,
  parseTimeToMinutes,
  isServiceInProgress,
  TIMEZONE,
  type ScheduledService,
} from "@/hooks/useParishSchedule";
import { getServicesForDate } from "../../../shared/scheduleEngine";
import { downloadMassICS } from "@/lib/icsGenerator";

// ─── Types ────────────────────────────────────────────────────────────────────

type MassState =
  | {
      type: "in_progress";
      service: ScheduledService;
      elapsed: string;
      progressPct: number;
      endsIn: string;
    }
  | {
      type: "upcoming";
      service: ScheduledService;
      daysAhead: number;
      dayLabel: string;
      countdown: string;
      nextMasses: Array<{ service: ScheduledService; daysAhead: number; dayLabel: string; date: Date }>;
    }
  | { type: "none" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getNowET(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return "now";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s.toString().padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

function formatDaysAhead(daysAhead: number, date: Date): string {
  if (daysAhead === 0) return "Today";
  if (daysAhead === 1) return "Tomorrow";
  return DAY_NAMES[date.getDay()];
}

// ─── Hook: compute mass state every second ───────────────────────────────────

function useMassState(schedule: ReturnType<typeof useParishSchedule>["schedule"]): MassState {
    const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return useMemo((): MassState => {
    if (!schedule) return { type: "none" };

    const now = getNowET();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    // ── Check if a Mass is currently in progress ──────────────────────────
    const todayServices = getServicesForDate(schedule, now);
    const massServices = todayServices.filter(s => s.type === "mass");

    for (const svc of massServices) {
      if (isServiceInProgress(svc, currentMin)) {
        const startMin = parseTimeToMinutes(svc.time);
        const elapsedMin = currentMin - startMin;
        const endMin = startMin + svc.durationMin;
        const remainMin = endMin - currentMin;
        const progressPct = Math.min(100, Math.round((elapsedMin / svc.durationMin) * 100));
        const elapsed = elapsedMin === 1 ? "1 min in" : `${elapsedMin} min in`;
        const endsIn = remainMin <= 1 ? "ending soon" : `ends in ${remainMin}m`;
        return { type: "in_progress", service: svc, elapsed, progressPct, endsIn };
      }
    }

    // ── Find next upcoming Mass ───────────────────────────────────────────
    // Collect next 3 upcoming masses for the "coming up" list
    const upcoming: Array<{ service: ScheduledService; daysAhead: number; dayLabel: string; date: Date }> = [];

    for (let ahead = 0; ahead <= 7 && upcoming.length < 4; ahead++) {
      const date = new Date(now);
      date.setDate(now.getDate() + ahead);
      const services = getServicesForDate(schedule, date);
      const masses = services.filter(s => s.type === "mass");

      for (const svc of masses) {
        if (upcoming.length >= 4) break;
        const svcMin = parseTimeToMinutes(svc.time);
        // Skip past services on today
        if (ahead === 0 && svcMin <= currentMin) continue;
        upcoming.push({ service: svc, daysAhead: ahead, dayLabel: formatDaysAhead(ahead, date), date });
      }
    }

    if (upcoming.length === 0) return { type: "none" };

    const first = upcoming[0];
    const svcMin = parseTimeToMinutes(first.service.time);
    const totalSeconds = first.daysAhead * 86400 + (svcMin - currentMin) * 60 - now.getSeconds();
    const countdown = totalSeconds > 86400
      ? `in ${first.daysAhead} day${first.daysAhead > 1 ? "s" : ""}`
      : formatCountdown(Math.max(0, totalSeconds));

    return {
      type: "upcoming",
      service: first.service,
      daysAhead: first.daysAhead,
      dayLabel: first.dayLabel,
      countdown,
      nextMasses: upcoming.slice(1), // remaining 3 after the first
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, tick]);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NextMassCountdown() {
  const { schedule, isLoading } = useParishSchedule();
  const state = useMassState(schedule);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 overflow-hidden bg-card shadow-sm animate-pulse">
        <div className="px-4 py-3 border-b border-border/30 bg-muted/10 flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <div className="w-32 h-4 rounded bg-muted" />
        </div>
        <div className="p-5 space-y-3">
          <div className="w-24 h-3 rounded bg-muted" />
          <div className="w-48 h-8 rounded bg-muted" />
          <div className="w-36 h-3 rounded bg-muted" />
        </div>
      </div>
    );
  }

  // ── No upcoming Mass ──────────────────────────────────────────────────────
  if (state.type === "none") return null;

  // ── Mass in progress ──────────────────────────────────────────────────────
  if (state.type === "in_progress") {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 overflow-hidden bg-card shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-serif text-base font-bold text-emerald-800 dark:text-emerald-300">Mass in Progress</span>
          </div>
          <Link href="/mass-times" className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium">
            Schedule <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {/* Body */}
        <div className="p-5">
          <p className="text-2xl font-serif font-bold text-foreground mb-1">{state.service.name}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {state.service.time} &middot; {state.elapsed} &middot; <span className="text-emerald-600 dark:text-emerald-400 font-medium">{state.endsIn}</span>
          </p>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${state.progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">{state.progressPct}% complete</p>
        </div>
      </div>
    );
  }

  // ── Upcoming Mass countdown ───────────────────────────────────────────────
  const { service, dayLabel, countdown, nextMasses } = state;
  const isToday = state.daysAhead === 0;
  const isSoon = state.daysAhead === 0; // show seconds when today

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-serif text-lg font-bold text-foreground">Next Mass</span>
        </div>
        <Link href="/mass-times" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
          Full Schedule <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Primary countdown */}
      <div className="px-5 pt-5 pb-4">
        {/* Day + service name */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isToday
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            {dayLabel}
          </span>
          <span className="text-sm text-muted-foreground">{service.name}</span>
        </div>

        {/* Time */}
        <p className="text-3xl font-serif font-bold text-foreground tracking-tight mb-2">{service.time}</p>

        {/* Countdown pill */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-sm font-bold ${
            isSoon
              ? "bg-primary text-white shadow-md shadow-primary/30"
              : "bg-muted text-foreground"
          }`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${isSoon ? "bg-white" : "bg-primary"}`} />
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isSoon ? "bg-white" : "bg-primary"}`} />
            </span>
            {countdown}
          </span>

          {/* Add to Calendar */}
          <button
            onClick={() => downloadMassICS({
              title: `${service.name} – St. Patrick in Armonk`,
              day: dayLabel,
              time: service.time,
              location: "St. Patrick's Church, 29 Cox Ave, Armonk, NY 10504",
            })}
            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Add to Calendar"
            aria-label="Add this Mass to your calendar"
          >
            <CalendarPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upcoming masses list */}
      {nextMasses.length > 0 && (
        <div className="border-t border-border/30 px-4 py-2 space-y-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Also Coming Up</p>
          {nextMasses.map((m, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{m.dayLabel}</span>
                <span className="text-sm font-medium text-foreground">{m.service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{m.service.time}</span>
                <button
                  onClick={() => downloadMassICS({
                    title: `${m.service.name} – St. Patrick in Armonk`,
                    day: m.dayLabel,
                    time: m.service.time,
                    location: "St. Patrick's Church, 29 Cox Ave, Armonk, NY 10504",
                  })}
                  className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  title="Add to Calendar"
                  aria-label={`Add ${m.service.name} on ${m.dayLabel} to your calendar`}
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
