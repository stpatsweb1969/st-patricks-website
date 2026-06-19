/**
 * RainAlertBanner — Subtle, dismissible banner shown when there's a 60%+
 * chance of rain during the next upcoming service's hour window.
 * Uses the per-service weather data from the forEvents endpoint.
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { CloudRain, X } from "lucide-react";
import {
  DAILY_SCHEDULE,
  parseServiceMinutes,
  TIMEZONE,
} from "@/components/this-week/scheduleConfig";

export function RainAlertBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Find the next upcoming service (today or tomorrow)
  const nextService = useMemo(() => {
    const et = new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
    const currentMin = et.getHours() * 60 + et.getMinutes();
    const todayDow = et.getDay();

    // Check today's remaining services
    const todayServices = DAILY_SCHEDULE[todayDow] || [];
    for (const svc of todayServices) {
      const svcMin = parseServiceMinutes(svc.time);
      if (svcMin > currentMin) {
        // This service is still upcoming today
        const d = new Date(et);
        d.setHours(Math.floor(svcMin / 60), svcMin % 60, 0, 0);
        return { svc, date: d, label: `today at ${svc.time}` };
      }
    }

    // Check tomorrow's services
    const tomorrow = new Date(et);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDow = tomorrow.getDay();
    const tomorrowServices = DAILY_SCHEDULE[tomorrowDow] || [];
    if (tomorrowServices.length > 0) {
      const svc = tomorrowServices[0];
      const svcMin = parseServiceMinutes(svc.time);
      const d = new Date(tomorrow);
      d.setHours(Math.floor(svcMin / 60), svcMin % 60, 0, 0);
      return { svc, date: d, label: `tomorrow at ${svc.time}` };
    }

    return null;
  }, []);

  // Build event query for the next service
  const serviceEvents = useMemo(() => {
    if (!nextService) return [];
    return [{
      id: "rain-alert-svc",
      title: nextService.svc.label,
      startDate: nextService.date.toISOString(),
    }];
  }, [nextService]);

  const { data: weatherMap } = trpc.weather.forEvents.useQuery(
    { events: serviceEvents },
    { enabled: serviceEvents.length > 0, staleTime: 30 * 60 * 1000 }
  );

  if (dismissed || !nextService) return null;

  const weather = weatherMap?.["rain-alert-svc"]?.weather;
  if (!weather || weather.precipProbability < 60) return null;

  return (
    <div className="container mt-3 mb-0">
      <div role="alert" aria-live="polite" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
        <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <p className="text-sm text-blue-800 dark:text-blue-200 flex-1">
          <span className="font-semibold">Rain likely {nextService.label}</span>
          <span className="text-blue-600 dark:text-blue-300"> — {weather.precipProbability}% chance — bring an umbrella</span>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shrink-0"
          aria-label="Dismiss rain alert"
        >
          <X className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
        </button>
      </div>
    </div>
  );
}
