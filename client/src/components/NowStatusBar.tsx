import { useState, useEffect, useMemo } from "react";
import { Church, Cross, Sun, ChevronRight } from "lucide-react";
import { ColorfulWeatherIcon } from "@/components/WeatherIcons";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  useParishSchedule,
  parseTimeToMinutes,
  getServicesForDay,
  isServiceInProgress,
  TIMEZONE,
} from "@/hooks/useParishSchedule";
import type { ScheduledService } from "@/hooks/useParishSchedule";

function getServiceIcon(type: string) {
  switch (type) {
    case "mass": return Church;
    case "confession": return Cross;
    case "prayer": return Sun;
    default: return Church;
  }
}

function getServiceColor(type: string) {
  switch (type) {
    case "mass": return "text-primary";
    case "confession": return "text-purple-600";
    case "prayer": return "text-amber-600";
    default: return "text-primary";
  }
}

interface MassStatus {
  isActive: boolean;
  activeType?: string;
  activeLabel?: string;
  remainingMin?: number;
  nextLabel: string;
  nextTime: string;
  nextDay: string;
  countdownText: string;
  todaySchedule: { type: string; label: string; time: string; isPast: boolean; isCurrent: boolean }[];
  confessionText: string;
}

function getMassStatus(now: Date, services: ScheduledService[]): MassStatus {
  const day = now.getDay();
  const month = now.getMonth() + 1;
  const currentMin = now.getHours() * 60 + now.getMinutes();

  // Get today's services from the shared engine (date-aware: respects firstOfMonth)
  const today = new Date();
  const dayOfMonth = today.getDate();
  const todayServices = services
    .filter(s => {
      if (s.dayOfWeek !== day) return false;
      if (s.seasonal && !s.seasonal.months.includes(month)) return false;
      if (s.firstOfMonth && dayOfMonth > 7) return false;
      return true;
    })
    .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  const todaySchedule = todayServices.map(s => {
    const startMin = parseTimeToMinutes(s.time);
    const endMin = startMin + s.durationMin;
    const isPast = currentMin >= endMin;
    const isCurrent = currentMin >= startMin && currentMin < endMin;
    return { type: s.type, label: s.name, time: s.time, isPast, isCurrent };
  });

  // Check if something is active right now
  for (const s of todayServices) {
    const startMin = parseTimeToMinutes(s.time);
    const endMin = startMin + s.durationMin;
    if (currentMin >= startMin && currentMin < endMin) {
      const remaining = endMin - currentMin;
      const { nextLabel, nextTime, nextDay, countdownText } = findNextMass(services, day, currentMin, month);
      return {
        isActive: true,
        activeType: s.type,
        activeLabel: s.name,
        remainingMin: remaining,
        nextLabel,
        nextTime,
        nextDay,
        countdownText,
        todaySchedule,
        confessionText: getConfessionText(services),
      };
    }
  }

  // Nothing active — find next mass
  const { nextLabel, nextTime, nextDay, countdownText } = findNextMass(services, day, currentMin, month);
  return {
    isActive: false,
    nextLabel,
    nextTime,
    nextDay,
    countdownText,
    todaySchedule,
    confessionText: getConfessionText(services),
  };
}

function getConfessionText(services: ScheduledService[]): string {
  const confession = services.find(s => s.type === "confession");
  if (!confession) return "";
  const startMin = parseTimeToMinutes(confession.time);
  const endMin = startMin + confession.durationMin;
  const endH = Math.floor(endMin / 60);
  const endM = endMin % 60;
  const endPeriod = endH >= 12 ? "PM" : "AM";
  const endHour = endH > 12 ? endH - 12 : endH;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[confession.dayOfWeek]} ${confession.time.replace(/ (AM|PM)/, "")}–${endHour}:${endM.toString().padStart(2, "0")} ${endPeriod}`;
}

function findNextMass(services: ScheduledService[], currentDay: number, currentMin: number, month: number) {
  let minDiff = Infinity;
  let nextLabel = "";
  let nextTime = "";
  let nextDay = "";

  const massItems = services.filter(s => s.type === "mass" && (!s.seasonal || s.seasonal.months.includes(month)));
  for (const s of massItems) {
    let daysAhead = s.dayOfWeek - currentDay;
    if (daysAhead < 0) daysAhead += 7;
    const startMin = parseTimeToMinutes(s.time);
    let diffMinutes = daysAhead * 24 * 60 + (startMin - currentMin);
    if (diffMinutes <= 0) diffMinutes += 7 * 24 * 60;
    if (diffMinutes < minDiff) {
      minDiff = diffMinutes;
      nextLabel = s.name;
      nextTime = s.time;
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      nextDay = days[s.dayOfWeek];
    }
  }

  let countdownText = "";
  if (minDiff < 60) {
    countdownText = `${minDiff}m`;
  } else if (minDiff < 24 * 60) {
    const h = Math.floor(minDiff / 60);
    const m = minDiff % 60;
    countdownText = m > 0 ? `${h}h ${m}m` : `${h}h`;
  } else {
    const d = Math.floor(minDiff / (24 * 60));
    countdownText = `${d}d`;
  }

  return { nextLabel, nextTime, nextDay, countdownText };
}

function CurrentWeatherPill() {
  const { data: weather } = trpc.weather.current.useQuery(undefined, {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  if (!weather) return null;
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-sky-500/8 text-sky-700 dark:text-sky-300 shrink-0">
      <ColorfulWeatherIcon icon={weather.icon} className="w-4 h-4" />
      <span>{weather.temperature}°F</span>
    </div>
  );
}

export function NowStatusBar() {
  const { schedule } = useParishSchedule();
  const [now, setNow] = useState(() => {
    const d = new Date();
    return new Date(d.toLocaleString("en-US", { timeZone: TIMEZONE }));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNow(new Date(d.toLocaleString("en-US", { timeZone: TIMEZONE })));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const services = schedule?.services ?? [];
  const status = useMemo(() => getMassStatus(now, services), [now, services]);

  return (
    <div className="space-y-3">
      {/* Primary Status Bar */}
      <Link href="/mass-times">
        <div className={`
          group flex items-center gap-3 px-4 py-3 rounded-xl
          border transition-all duration-200 cursor-pointer
          ${status.isActive
            ? "bg-primary/5 border-primary/20 shadow-sm"
            : "bg-card border-border/60 shadow-sm hover:border-primary/20 hover:shadow-md"
          }
        `}>
          {/* Pulsing dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {status.isActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              status.isActive ? "bg-primary" : "bg-emerald-500"
            }`} />
          </span>

          {/* Icon */}
          {status.isActive && status.activeType ? (
            (() => {
              const Icon = getServiceIcon(status.activeType);
              return <Icon className={`w-4.5 h-4.5 shrink-0 ${getServiceColor(status.activeType)}`} />;
            })()
          ) : (
            <Church className="w-4.5 h-4.5 shrink-0 text-primary/70" />
          )}

          {/* Text */}
          <div className="flex-1 min-w-0" aria-live="polite" aria-atomic="true">
            {status.isActive ? (
              <span className="text-sm font-semibold text-primary">
                {status.activeLabel} in Progress — {status.remainingMin}m remaining
              </span>
            ) : (
              <span className="text-sm font-semibold text-foreground/80">
                Next Mass in {status.countdownText} — {status.nextDay} {status.nextTime}
              </span>
            )}
          </div>

          {/* Current weather */}
          <CurrentWeatherPill />

          {/* CTA arrow */}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </Link>

      {/* Today's Schedule Pills */}
      {status.todaySchedule.length > 0 && (
        <div className="flex items-center gap-2 px-1 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Today</span>
          <div className="flex gap-1.5 flex-wrap">
            {status.todaySchedule.map((item, i) => {
              const Icon = getServiceIcon(item.type);
              return (
                <div
                  key={i}
                  className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    transition-all duration-200
                    ${item.isCurrent
                      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                      : item.isPast
                        ? "bg-muted/40 text-muted-foreground opacity-60"
                        : "bg-muted/60 text-foreground/70"
                    }
                  `}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
              );
            })}
          </div>
          {/* Confession indicator */}
          {status.confessionText && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/8 text-purple-600 shrink-0 ml-auto">
              <Cross className="w-3 h-3" />
              <span>{status.confessionText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
